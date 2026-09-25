import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, CustomEase, DrawSVGPlugin, ScrambleTextPlugin, ScrollTrigger, SplitText, TextPlugin);

// Same curves as the CSS tokens (--ease-out-strong, --ease-in-out-strong), so JS and CSS motion match.
CustomEase.create("ui-out", "M0,0 C0.23,1 0.32,1 1,1");
CustomEase.create("ui-in-out", "M0,0 C0.77,0 0.175,1 1,1");

// Every animation lives inside this query. With reduced motion, the static markup is the final state.
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const DESKTOP_MOTION = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
export const FINE_POINTER = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, SplitText, useGSAP };
