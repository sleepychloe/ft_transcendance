export function createScriptTag(path) {
        if (!path) return null;
        if (document.getElementById(path) === null) {
                var scriptTag = document.createElement("script");
                scriptTag.id = 'script-path-' + path;
                scriptTag.src = path;
                return scriptTag;
        }
        return null;
}
