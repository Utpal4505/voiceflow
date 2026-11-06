use std::net::{SocketAddr, TcpStream};
use std::path::PathBuf;
use std::process::{Child, Command};
use std::time::Duration;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

pub fn is_server_running() -> bool {
    let addr: SocketAddr = "127.0.0.1:3001".parse().unwrap();
    TcpStream::connect_timeout(&addr, Duration::from_millis(200)).is_ok()
}

fn get_search_roots() -> Vec<PathBuf> {
    let mut roots = Vec::new();

    // 1. Current working directory and all its parents
    if let Ok(cwd) = std::env::current_dir() {
        let mut curr = cwd.clone();
        roots.push(curr.clone());
        while let Some(parent) = curr.parent() {
            roots.push(parent.to_path_buf());
            curr = parent.to_path_buf();
        }
    }

    // 2. Current executable directory and all its parents
    if let Ok(exe) = std::env::current_exe() {
        if let Some(exe_dir) = exe.parent() {
            let mut curr = exe_dir.to_path_buf();
            roots.push(curr.clone());
            while let Some(parent) = curr.parent() {
                roots.push(parent.to_path_buf());
                curr = parent.to_path_buf();
            }
        }
    }

    roots
}

fn find_standalone_server() -> Option<PathBuf> {
    let roots = get_search_roots();
    for root in &roots {
        let candidates = [
            root.join("voiceflow-server.exe"),
            root.join("server").join("voiceflow-server.exe"),
            root.join("bin").join("voiceflow-server.exe"),
        ];
        for c in &candidates {
            if c.exists() {
                return Some(c.clone());
            }
        }
    }
    None
}

fn find_api_script_and_workdir() -> Option<(PathBuf, PathBuf)> {
    let roots = get_search_roots();
    for root in &roots {
        // Monorepo development: root is repo root containing apps/api/dist/main.js
        let dev_candidate = root.join("apps").join("api").join("dist").join("main.js");
        if dev_candidate.exists() {
            return Some((dev_candidate, root.clone()));
        }

        // Direct api package directory: root/api/dist/main.js
        let api_candidate = root.join("api").join("dist").join("main.js");
        if api_candidate.exists() {
            let workdir = if root.join("package.json").exists() {
                root.clone()
            } else if let Some(p) = root.parent() {
                p.to_path_buf()
            } else {
                root.clone()
            };
            return Some((api_candidate, workdir));
        }

        // Production bundle structure: root/server/dist/main.js
        let prod_server = root.join("server").join("dist").join("main.js");
        if prod_server.exists() {
            return Some((prod_server, root.clone()));
        }

        // Direct dist/main.js
        let direct_dist = root.join("dist").join("main.js");
        if direct_dist.exists() {
            return Some((direct_dist, root.clone()));
        }
    }
    None
}

fn find_node_binary(workdir: &PathBuf) -> PathBuf {
    // 1. Check for bundled portable node runtime
    let candidates = [
        workdir.join("server").join("node.exe"),
        workdir.join("node.exe"),
        workdir.join("bin").join("node.exe"),
    ];

    for c in &candidates {
        if c.exists() {
            return c.clone();
        }
    }

    // 2. Check all search roots
    for root in &get_search_roots() {
        let node_c = root.join("node.exe");
        if node_c.exists() {
            return node_c;
        }
    }

    // 3. Fallback to system node
    PathBuf::from("node")
}

pub fn start_server_if_needed() -> Option<Child> {
    if is_server_running() {
        println!("[ServerManager] API server already running on port 3001");
        return None;
    }

    // Check for standalone compiled server binary first
    if let Some(standalone_bin) = find_standalone_server() {
        println!("[ServerManager] Found standalone server: {:?}", standalone_bin);
        let mut cmd = Command::new(&standalone_bin);

        if let Some(parent) = standalone_bin.parent() {
            cmd.current_dir(parent);
        }

        #[cfg(target_os = "windows")]
        cmd.creation_flags(CREATE_NO_WINDOW);

        if let Ok(child) = cmd.spawn() {
            println!("[ServerManager] Launched standalone server (PID: {})", child.id());
            for _ in 0..30 {
                std::thread::sleep(Duration::from_millis(100));
                if is_server_running() {
                    println!("[ServerManager] Standalone server ready on port 3001");
                    break;
                }
            }
            return Some(child);
        }
    }

    println!("[ServerManager] Port 3001 not detected. Launching background server...");

    if let Some((script, workdir)) = find_api_script_and_workdir() {
        let node_bin = find_node_binary(&workdir);
        println!("[ServerManager] Using Node binary: {:?}", node_bin);
        println!("[ServerManager] Using API script: {:?}", script);
        println!("[ServerManager] Using working directory: {:?}", workdir);

        let mut cmd = Command::new(node_bin);
        cmd.arg(&script);
        cmd.current_dir(&workdir);

        let log_path = workdir.join("voiceflow-server.log");
        println!("[ServerManager] Redirecting API logs to: {:?}", log_path);
        if let Ok(log_file) = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&log_path)
        {
            if let Ok(err_file) = log_file.try_clone() {
                cmd.stdout(log_file);
                cmd.stderr(err_file);
            }
        }

        #[cfg(target_os = "windows")]
        cmd.creation_flags(CREATE_NO_WINDOW);

        match cmd.spawn() {
            Ok(child) => {
                println!("[ServerManager] Started background API process (PID: {})", child.id());
                for _ in 0..35 {
                    std::thread::sleep(Duration::from_millis(100));
                    if is_server_running() {
                        println!("[ServerManager] API server is ready on port 3001");
                        break;
                    }
                }
                return Some(child);
            }
            Err(e) => {
                eprintln!("[ServerManager] Failed to launch background API: {}", e);
            }
        }
    } else {
        eprintln!("[ServerManager] Could not locate API server script. Please run 'pnpm --filter @voiceflow/api build'");
    }

    None
}

pub fn stop_server(child: &mut Child) {
    println!("[ServerManager] Terminating background server (PID: {})...", child.id());
    let _ = child.kill();
    let _ = child.wait();
}
