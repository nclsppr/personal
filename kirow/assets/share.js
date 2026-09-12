/* Static links are the baseline. Native sharing runs only from a user click. */
document.querySelectorAll('[data-share-section]').forEach((section) => {
  const nativeButton = section.querySelector('[data-share-native]');
  const copyButton = section.querySelector('[data-share-copy]');
  const address = section.querySelector('[data-share-address]');
  const status = section.querySelector('[data-share-status]');
  const smsLink = section.querySelector('[data-share-sms]');
  const url = section.dataset.shareUrl;
  if (!nativeButton || !copyButton || !address || !status || !url) return;

  const announce = (key) => { status.textContent = section.dataset[key] || ''; };
  const selectAddress = () => {
    address.focus({ preventScroll: true });
    address.select();
    address.setSelectionRange(0, address.value.length);
  };

  // iOS uses an ampersand for a prefilled SMS body. Other clients keep the URI form.
  const appleDevice = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  if (smsLink && appleDevice) smsLink.href = `sms:&body=${encodeURIComponent(url)}`;

  address.addEventListener('click', selectAddress);

  if (window.isSecureContext && typeof navigator.clipboard?.writeText === 'function') {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      if (copyButton.disabled) return;
      copyButton.disabled = true;
      try {
        await navigator.clipboard.writeText(url);
        announce('copyDone');
      } catch {
        announce('copyFailed');
        selectAddress();
      } finally {
        copyButton.disabled = false;
      }
    });
  }

  if (window.isSecureContext && typeof navigator.share === 'function') {
    const data = { title: section.dataset.shareTitle, text: section.dataset.shareText, url };
    let supported = true;
    try {
      if (typeof navigator.canShare === 'function') supported = navigator.canShare(data);
    } catch {
      supported = false;
    }
    if (!supported) return;

    nativeButton.hidden = false;
    nativeButton.addEventListener('click', async () => {
      if (nativeButton.disabled) return;
      nativeButton.disabled = true;
      announce('shareOpening');
      try {
        // No fetch or other await before this call: keep transient user activation.
        await navigator.share(data);
        // Resolution does not consistently mean the recipient received anything.
        announce('shareOpened');
      } catch (error) {
        if (error?.name === 'AbortError') {
          announce('shareCancelled');
        } else {
          announce('shareFailed');
          selectAddress();
        }
      } finally {
        nativeButton.disabled = false;
      }
    });
  }
});
