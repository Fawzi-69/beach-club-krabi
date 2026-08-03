/* Shim standalone : dans Claude Design ce fichier est le panneau d'édition ;
   ici il ne sert à rien, on garde juste l'API pour promo-scenes.jsx. */
(() => {
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  const setTweak = React.useCallback((k, v) => setValues(p => ({ ...p, [k]: v })), []);
  return [values, setTweak];
}
const TweaksPanel = () => null;
const TweakSection = () => null;
const TweakToggle = () => null;
Object.assign(window, { useTweaks, TweaksPanel, TweakSection, TweakToggle });
})();