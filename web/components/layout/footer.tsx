import type { JSX } from "react";
import { DEGOOG_URL } from "../../config";

export const Footer = (): JSX.Element => (
  <footer id="home-footer">
    <a href={DEGOOG_URL}>degoog</a>
  </footer>
);
