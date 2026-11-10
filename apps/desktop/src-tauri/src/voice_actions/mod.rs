pub mod executor;
pub mod intent;
pub mod parser;

pub use intent::{ActionIntent, ActionResult};
pub use parser::parse_voice_command;
pub use executor::execute_intent;
