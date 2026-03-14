"use client";

import { type ReactNode, useCallback } from "react";

/**
 * Prevents HeroUI's internal usePress (from @react-aria/interactions) from
 * hijacking pointer/mouse events on native input and textarea elements.
 *
 * usePress on the input wrapper calls disableTextSelection() on pointerdown,
 * which blocks cursor positioning, text selection, and copy/paste with mouse.
 * By stopping propagation in React's capture phase, we prevent usePress from
 * processing the event while preserving native input behavior.
 */
export function InputInteractionFix({ children }: { children: ReactNode }) {
	const handleCapture = useCallback((e: React.SyntheticEvent) => {
		const target = e.target;
		if (
			(target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement) &&
			(target as HTMLElement).closest('[data-slot="input-wrapper"]')
		) {
			e.stopPropagation();
		}
	}, []);

	return (
		<div
			style={{ display: "contents" }}
			onPointerDownCapture={handleCapture}
			onMouseDownCapture={handleCapture}
		>
			{children}
		</div>
	);
}
