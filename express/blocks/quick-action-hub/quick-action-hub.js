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

import {
  createTag,
// eslint-disable-next-line import/no-unresolved
} from '../../scripts/scripts.js';

export default function decorate($block) {
  const $rows = Array.from($block.children);
  const $header = $rows[0].firstChild;
  const $container = createTag('div', { class: 'quick-action-hub-container' });

  $header.classList.add('quick-action-hub-header');

  for (let i = 1; i < $rows.length; i += 1) {
    const $column = $rows[i].firstChild;

    if ($column) {
      const $columnRows = $column.querySelectorAll('p');

      $columnRows.forEach(($row) => {
        const $svg = $row.querySelector('svg');
        const $link = $row.querySelector('a');

        $link.prepend($svg);
        $column.append($link);
        $row.remove();
      });

      $column.classList.add('quick-action-hub-column');
      $container.append($column);
    }
  }

  $block.innerHTML = '';

  $block.append($header);
  $block.append($container);
}
