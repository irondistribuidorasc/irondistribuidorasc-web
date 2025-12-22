type StagingBannerProps = {
	isStaging: boolean;
};

export function StagingBanner({ isStaging }: StagingBannerProps) {
	if (!isStaging) {
		return null;
	}

	return (
		<div className="relative z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 py-2 text-center">
			<div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4">
				<span className="inline-flex items-center gap-1.5">
					<svg
						className="h-4 w-4 animate-pulse text-white"
						fill="currentColor"
						viewBox="0 0 20 20"
						aria-hidden="true"
					>
						<path
							fillRule="evenodd"
							d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
							clipRule="evenodd"
						/>
					</svg>
					<span className="text-xs font-bold uppercase tracking-wider text-white sm:text-sm">
						Ambiente de Homologação (Staging)
					</span>
					<svg
						className="h-4 w-4 animate-pulse text-white"
						fill="currentColor"
						viewBox="0 0 20 20"
						aria-hidden="true"
					>
						<path
							fillRule="evenodd"
							d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
							clipRule="evenodd"
						/>
					</svg>
				</span>
			</div>
			<p className="mt-0.5 text-[10px] text-white/90 sm:text-xs">
				Este ambiente é apenas para testes. Os dados podem ser alterados ou
				removidos a qualquer momento.
			</p>
		</div>
	);
}
