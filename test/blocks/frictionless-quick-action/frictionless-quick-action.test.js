import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

import init from '../../../express/blocks/frictionless-quick-action/frictionless-quick-action.js';
import { setConfig } from '../../../express/scripts/utils.js';

const locales = {
  '': { ietf: 'en-US', tk: 'hah7vzn.css' },
  br: { ietf: 'pt-BR', tk: 'inq1xob.css' },
  cn: { ietf: 'zh-Hans-CN', tk: 'puu3xkp' },
  de: { ietf: 'de-DE', tk: 'vin7zsi.css' },
  dk: { ietf: 'da-DK', tk: 'aaz7dvd.css' },
  es: { ietf: 'es-ES', tk: 'oln4yqj.css' },
  fi: { ietf: 'fi-FI', tk: 'aaz7dvd.css' },
  fr: { ietf: 'fr-FR', tk: 'vrk5vyv.css' },
  gb: { ietf: 'en-GB', tk: 'pps7abe.css' },
  in: { ietf: 'en-GB', tk: 'pps7abe.css' },
  it: { ietf: 'it-IT', tk: 'bbf5pok.css' },
  jp: { ietf: 'ja-JP', tk: 'dvg6awq' },
  kr: { ietf: 'ko-KR', tk: 'qjs5sfm' },
  nl: { ietf: 'nl-NL', tk: 'cya6bri.css' },
  no: { ietf: 'no-NO', tk: 'aaz7dvd.css' },
  se: { ietf: 'sv-SE', tk: 'fpk1pcd.css' },
  tw: { ietf: 'zh-Hant-TW', tk: 'jay0ecd' },
  uk: { ietf: 'en-GB', tk: 'pps7abe.css' },
};

setConfig({ locales });
document.body.innerHTML = await readFile({ path: './mocks/crop-image-quick-action.html' });

describe('Frictionless Quick Action Block', () => {
  it('initializes correctly', async () => {
    const block = document.body.querySelector('.frictionless-quick-action');
    init(block);
    const title = block.querySelector(':scope h1');
    const text = block.querySelector('div:nth-child(1) p');
    expect(title).to.not.be.null;
    expect(title.textContent).to.be.equal('Crop your image for free.');
    expect(text).to.not.be.null;
    expect(text.textContent).to.be.equal('The online Crop image tool from Adobe Express transforms your images into the perfect size in seconds.');
    const video = block.querySelector('div:nth-child(2) > div:nth-child(1) video');
    expect(video).to.not.be.null;
    const dropzone = block.querySelector('div:nth-child(2) > div:nth-child(2) .dropzone');
    const dropzoneTitle = dropzone.querySelector(':scope > h4');
    expect(dropzoneTitle.textContent).to.be.equal('Drag and drop an image or browse to upload.');
    const lottie = dropzone.querySelector(':scope lottie-player');
    expect(lottie).to.not.be.null;
  });

  it('sdk starts on file drop', async () => {
    const block = document.body.querySelector('.frictionless-quick-action');
    init(block);
    const dropzoneContainer = block.querySelector(':scope .dropzone-container');
    const file = new File([''], 'test', { type: 'image/png' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    const event = new DragEvent('drop', { dataTransfer });
    const callback = function (mutationsList, observer) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'SCRIPT') {
              console.log('A new script tag was added:', node);
              const script = document.querySelector('head > script[src="https://sdk.cc-embed.adobe.com/v3/CCEverywhere.js"]');
              expect(script).to.not.be.null;
              observer.disconnect();
            }
          });
        }
      }
    };
    const observer = new MutationObserver(callback);
    observer.observe(document.head, { childList: true, subtree: true });
    dropzoneContainer.dispatchEvent(event);
  });
});
