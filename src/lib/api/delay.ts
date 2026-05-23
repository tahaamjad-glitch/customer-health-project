export const delay = (ms = 600): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, ms))
