import lightDefault 				from './light-default.js'
import darkDefault  				from './dark-default.js'
import greenComfortLight  			from './green-comfort-light.js'
import greenComfortDark  			from './green-comfort-dark.js'

/**
 * 主题管理
 * @typedef {import('@/renderer/core/AppRenderer.js').default} AppRenderer
 */

class ThemesManager {

	/** @type {AppRenderer} */
	#appRenderer = null;

	#themeRegistryIndex = 0;
    #themeDefinitionMap = new Map();
    #builtinThemeIdMap = new Map();


	#iconThemeMap = new Map();
	#iconThemeRegistryIndex = 0;

    constructor(){

    }

    init(appRenderer) {
		this.#appRenderer = appRenderer;
		
		this.registerTheme(lightDefault);
		this.registerTheme(darkDefault);
		this.registerTheme(greenComfortLight);
		this.registerTheme(greenComfortDark);

		this.registerIconTheme({
			id: "default",
			label: "Default",
			order: -100,
			icons: {
				workbench: {
					type: "svg",
					viewBox: "0 0 16 16",
					content:
						'<rect x="2" y="2" width="12" height="8" rx="1.5" ry="1.5" fill="none" stroke="currentColor" stroke-width="1.3"></rect><rect x="2" y="11.5" width="12" height="2.5" rx="1" ry="1" fill="currentColor" opacity="0.62"></rect>',
				},
				devtools: {
					type: "svg",
					viewBox: "0 0 16 16",
					content:
						'<path d="M5.9 12.3 1.6 8l4.3-4.3 1 1-3.3 3.3 3.3 3.3-1 1Zm4.2 0-1-1 3.3-3.3-3.3-3.3 1-1L14.4 8l-4.3 4.3Z" fill="currentColor"></path>',
				},
				github: {
					type: "svg",
					viewBox: "0 0 16 16",
					content:
						'<path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" fill="currentColor"></path>',
				},
			},
		});
	}
    
	registerTheme(themeDefinition = {}) {
		const appearance = ["light", "dark"].includes(themeDefinition.appearance) ? themeDefinition.appearance : "";
		const tokenEntries = Object.entries(themeDefinition.tokens || {}).filter(([key]) => key.startsWith("--app-theme-"));
		const entry = {
			id: themeDefinition.id,
			label: themeDefinition.label || themeDefinition.id,
			appearance,
			description: themeDefinition.description || "",
			pluginName: themeDefinition.pluginName || "builtin",
			module: themeDefinition.module || themeDefinition.pluginName || "builtin",
			order: Number.isFinite(themeDefinition.order) ? themeDefinition.order : 0,
			isBuiltin: themeDefinition.isBuiltin === true,
			registryIndex: ++this.#themeRegistryIndex,
			tokens: Object.fromEntries(tokenEntries),
		};

		if (!entry.id) {
			throw new TypeError("theme id is required");
		}

		if (!entry.appearance) {
			throw new TypeError("theme appearance only support light or dark");
		}

		if (!entry.label) {
			throw new TypeError("theme label is required");
		}

		if (!themeDefinition.tokens || typeof themeDefinition.tokens !== "object" || Array.isArray(themeDefinition.tokens)) {
			throw new TypeError("theme tokens must be a plain object");
		}

		this.#themeDefinitionMap.set(entry.id, entry);
		if (entry.isBuiltin) {
			this.#builtinThemeIdMap.set(entry.appearance, entry.id);
		}
		this.#appRenderer.emit("theme-registry-change");
		return { ...entry };
	}

	
	getThemeDefinition(themeId) {
		return this.#themeDefinitionMap.get(themeId) || null;
	}

	getThemeDefinitionList() {
		return Array.from(this.#themeDefinitionMap.values())
			.slice()
			.sort((a, b) => {
				if (a.order !== b.order) {
					return a.order - b.order;
				}

				return a.registryIndex - b.registryIndex;
			})
			.map((entry) => {
				const result = {
					...entry,
				};
				delete result.registryIndex;
				return {
					...result,
					tokens: { ...entry.tokens },
				};
			});
	}

	getBuiltinThemeDefinition(appearance) {
		const builtinThemeId = this.#builtinThemeIdMap.get(appearance);
		return builtinThemeId ? this.getThemeDefinition(builtinThemeId) : null;
	}

	registerIconTheme(iconTheme = {}) {
		const entry = {
			id: iconTheme.id,
			label: iconTheme.label || iconTheme.id,
			description: iconTheme.description || "",
			pluginName: iconTheme.pluginName || "builtin",
			module: iconTheme.module || iconTheme.pluginName || "builtin",
			order: Number.isFinite(iconTheme.order) ? iconTheme.order : 0,
			registryIndex: ++this.#iconThemeRegistryIndex,
			icons: {
				...(iconTheme.icons || {}),
			},
		};

		if (!entry.id) {
			throw new TypeError("icon theme id is required");
		}

		this.#iconThemeMap.set(entry.id, entry);
		this.#appRenderer.emit("theme-registry-change");
		return { ...entry, icons: { ...entry.icons } };
	}

	getIconTheme(iconThemeId) {
		return this.#iconThemeMap.get(iconThemeId) || null;
	}

	getIconThemeList() {
		return Array.from(this.#iconThemeMap.values())
			.slice()
			.sort((a, b) => {
				if (a.order !== b.order) {
					return a.order - b.order;
				}

				return a.registryIndex - b.registryIndex;
			})
			.map((entry) => {
				const result = {
					...entry,
				};
				delete result.registryIndex;
				return {
					...result,
					icons: { ...entry.icons },
				};
			});
	}

	findRegisteredIcon(iconKey, iconThemeId = "") {
		if (!iconKey || typeof iconKey !== "string") {
			return null;
		}

		if (iconKey.includes(":")) {
			const [themeId, name] = iconKey.split(":");
			const iconTheme = this.#iconThemeMap.get(themeId);
			const descriptor = iconTheme && iconTheme.icons ? iconTheme.icons[name] : null;
			return descriptor ? { ...descriptor } : null;
		}

		if (iconThemeId) {
			const activeTheme = this.#iconThemeMap.get(iconThemeId);
			const activeDescriptor = activeTheme?.icons?.[iconKey] || null;
			if (activeDescriptor) {
				return { ...activeDescriptor };
			}
		}

		for (const iconTheme of this.#iconThemeMap.values()) {
			if (!iconTheme?.icons[iconKey]) {
				continue;
			}

			return {
				...iconTheme.icons[iconKey],
			};
		}

		return null;
	}
	
	resolveIcon(icon, options = {}) {
		if (!icon) {
			return null;
		}

		if (typeof icon === "object" && icon.type) {
			return {
				...icon,
			};
		}

		if (typeof icon !== "string") {
			return null;
		}

		const iconThemeId = options.iconThemeId || "";
		const registeredIcon = this.findRegisteredIcon(icon, iconThemeId);
		if (registeredIcon) {
			return registeredIcon;
		}

		if (/^(https?:|data:|\/)/.test(icon) || /\.(png|jpg|jpeg|gif|svg|ico)$/i.test(icon)) {
			return {
				type: "image",
				src: icon,
			};
		}

		if (icon.startsWith("<svg")) {
			return {
				type: "svg",
				content: icon,
				viewBox: "0 0 16 16",
			};
		}

		return {
			type: "class",
			className: icon.startsWith("el-icon-") || /\s/.test(icon) ? icon : `el-icon-${icon}`,
		};
	}
}


export default new ThemesManager();