export function waitForAudioEvent(
  audioElement: HTMLElement,
  event = "durationchange",
) {
  return new Promise<void>((resolve) => {
    const handler = () => {
      audioElement.removeEventListener(event, handler); // Ensure the handler is called only once
      resolve();
    };
    audioElement.addEventListener(event, handler);
  });
}
