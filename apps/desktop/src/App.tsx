import MainWindow from "./windows/MainWindow";
import OverlayWindow from "./windows/OverlayWindow";

const isOverlay = window.location.hash === "#overlay";

export default function App() {
  return isOverlay ? <OverlayWindow /> : <MainWindow />;
}
