/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable import/named, import/extensions */

/*
 * Fragment Block
 * Include content from one Helix page in another.
 * https://www.hlx.live/developer/block-collection/fragment
 */

import {
  decorateMain,
  loadBlocks,
} from '../../scripts/utils.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();
      const sections = await decorateMain(main);
      loadBlocks(sections);
      return main;
    }
  }
  return null;
}

function injectFragmentOnPage(block, fragment) {
  const fragmentSection = fragment.querySelector(':scope .section');
  const blockSection = block.closest('.section');

  if (fragmentSection) {
    const audience = fragmentSection.dataset?.audience;
    if (audience) {
      if (audience !== document.body.dataset?.device) {
        block.closest('.section').remove();
        return;
      }
      block.closest('.section').dataset.audience = audience;
    }

    block.closest('.section')?.classList.add(...fragmentSection.classList);
    if (block.closest('.fragment-wrapper')) {
      block.closest('.fragment-wrapper').replaceWith(...fragmentSection.childNodes);
    } else {
      block.replaceWith(...fragmentSection.childNodes);
    }

    if (blockSection && blockSection.dataset.toggle) {
      block.style.opacity = '0';
      block.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        block.style.opacity = '1';
      });
    }
  }
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);

  if (fragment) {
    injectFragmentOnPage(block, fragment);
  }
}
