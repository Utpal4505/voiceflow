use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum ActionIntent {
    LaunchApp {
        app_name: String,
        executable_hint: Option<String>,
        display_name: String,
    },
    OpenUrl {
        url: String,
        domain: String,
    },
    SearchWeb {
        provider: String, // "google", "youtube", "github", "reddit", "twitter", "bing"
        query: String,
        url: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionResult {
    pub success: bool,
    pub message: String,
}
