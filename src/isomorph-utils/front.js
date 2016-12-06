function fetchInitialStates(renderProps) {
    return window.__jellyblogInitialStates__ || [];
}

export {
    fetchInitialStates
};