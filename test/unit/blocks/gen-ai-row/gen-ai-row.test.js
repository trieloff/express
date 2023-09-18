/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

const { default: decorate } = await import('../../../../express/blocks/gen-ai-row/gen-ai-row.js');
const testBody = await readFile({ path: './mocks/body.html' });

describe('Color How To Carousel', () => {
  beforeEach(() => {
    window.isTestEnv = true;
    document.body.innerHTML = testBody;
  });

  it('should have all things', async () => {
    const block = document.querySelector('.gen-ai-row');
    await decorate(block);
    expect(block).to.exist;
    expect(block.querySelector('.gen-ai-row-heading-section')).to.exist;
    const cards = block.querySelector('.carousel-container .carousel-platform');
    expect(cards).to.exist;
    expect(cards.querySelectorAll('.card').length).to.equal(4);
    expect(cards.querySelector('.card').classList.contains('gen-ai-action')).to.be.true;
    expect(cards.querySelectorAll('.card')[1].classList.contains('gen-ai-action')).to.be.false;
    expect(cards.querySelectorAll('.card')[2].classList.contains('gen-ai-action')).to.be.true;
    expect(cards.querySelectorAll('.card')[3].classList.contains('gen-ai-action')).to.be.true;
  });

  it('should have all cards with proper children', async () => {
    const block = document.querySelector('.gen-ai-row');
    await decorate(block);
    const cards = block.querySelector('.carousel-container .carousel-platform');
    for (const card of cards.querySelectorAll('.card')) {
      expect(card.querySelector('.text-wrapper .cta-card-desc')).to.exist;
      expect(card.querySelector('.text-wrapper .cta-card-title')).to.exist;
      expect(card.querySelector('.media-wrapper picture')).to.exist;
    }
    for (const card of cards.querySelectorAll('.card:not(.gen-ai-action)')) {
      const cta = card.querySelector('.links-wrapper a');
      expect(cta).to.exist;
      expect(cta.textContent).to.exist;
      expect(cta.href).to.exist;
    }
    for (const card of cards.querySelectorAll('.card.gen-ai-action')) {
      const form = card.querySelector('.gen-ai-input-form');
      expect(form).to.exist;
      const input = form.querySelector('input');
      const button = form.querySelector('button');
      expect(input).to.exist;
      expect(button).to.exist;
      expect(input.placeholder).to.exist;
      expect(button.textContent).to.exist;
      expect(button.classList.contains('gen-ai-submit')).to.be.true;
    }
  });

  // TODO: test the input and form submission and CTA click
});
