import {
  titleCase,
  getMetadata, getConfig,
} from './utils.js';

import {
  getDataWithContext,
} from './browse-api-controller.js';

import {
  constructTargetPath,
} from './template-redirect.js';

import fetchAllTemplatesMetadata from './all-templates-metadata.js';
import { initToggleTriggers } from '../blocks/shared/carousel.js';

const defaultRegex = /\/express\/templates\/default/;

async function fetchLinkList() {
  if (!window.linkLists) {
    window.linkLists = {};
    if (!window.linkLists.ckgData) {
      const response = await getDataWithContext({ urlPath: window.location.pathname });
      // catch data from CKG API, if empty, use top priority categories sheet
      if (response && response.queryResults[0].facets) {
        window.linkLists.ckgData = response.queryResults[0].facets[0].buckets.map((ckgItem) => {
          let formattedTasks;
          if (getMetadata('template-search-page') === 'Y') {
            const params = new Proxy(new URLSearchParams(window.location.search), {
              get: (searchParams, prop) => searchParams.get(prop),
            });
            formattedTasks = titleCase(params.tasks).replace(/[$@%"]/g, '');
          } else {
            formattedTasks = titleCase(getMetadata('tasks')).replace(/[$@%"]/g, '');
          }

          return {
            parent: formattedTasks,
            ckgID: ckgItem.canonicalName,
            displayValue: ckgItem.displayValue,
          };
        });
      }
    }

    if (!window.linkLists.sheetData) {
      const resp = await fetch('/express/templates/top-priority-categories.json');
      window.linkLists.sheetData = resp.ok ? (await resp.json()).data : [];
    }
  }
}

function replaceLinkPill(linkPill, data) {
  const clone = linkPill.cloneNode(true);
  if (data) {
    clone.innerHTML = clone.innerHTML.replace('/express/templates/default', data.url);
    clone.innerHTML = clone.innerHTML.replaceAll('Default', data['short-title']);
  }
  if (defaultRegex.test(clone.innerHTML)) {
    return null;
  }
  return clone;
}

async function updateSEOLinkList(container, linkPill, list) {
  const leftTrigger = container.querySelector('.carousel-left-trigger');
  const rightTrigger = container.querySelector('.carousel-right-trigger');

  container.innerHTML = '';

  const templatePages = await fetchAllTemplatesMetadata();

  if (list && templatePages) {
    if (leftTrigger) container.append(leftTrigger);

    list.forEach((d) => {
      const currentLocale = getConfig().locale.prefix.replace('/', '');
      const templatePageData = templatePages.find((p) => {
        const targetLocale = /^[a-z]{2}$/.test(p.url.split('/')[1]) ? p.url.split('/')[1] : '';
        const isLive = p.live === 'Y';
        const titleMatch = p['short-title']?.toLowerCase() === d.childSibling?.toLowerCase();
        const localeMatch = currentLocale === targetLocale;

        return isLive && titleMatch && localeMatch;
      });

      if (!templatePageData) return;

      const clone = replaceLinkPill(linkPill, templatePageData);
      if (clone) container.append(clone);
    });

    if (rightTrigger) container.append(rightTrigger);
  }
}

async function updateLinkList(container, linkPill, list) {
  const templatePages = await fetchAllTemplatesMetadata();
  const pageLinks = [];
  const searchLinks = [];
  const leftTrigger = container.querySelector('.carousel-left-trigger');
  const rightTrigger = container.querySelector('.carousel-right-trigger');
  container.innerHTML = '';

  const taskMeta = getMetadata('tasks');
  const currentTasks = taskMeta ? taskMeta.replace(/[$@%"]/g, '') : ' ';
  const currentTasksX = getMetadata('tasks-x') || '';

  if (list && templatePages) {
    list.forEach((d) => {
      const topics = getMetadata('topics') !== '" "' ? `${getMetadata('topics')?.replace(/[$@%"]/g, '')}` : '';
      const topicsQuery = `${topics} ${d.displayValue.toLowerCase()}`.split(' ')
        .filter((item, i, allItems) => i === allItems.indexOf(item))
        .join(' ')
        .replace(currentTasks, '')
        .replace(currentTasksX, '')
        .trim();
      const templatePageData = templatePages.find((p) => p.live === 'Y' && p.url === constructTargetPath(topicsQuery, currentTasks, currentTasksX));
      const displayText = d.displayValue;
      const prefix = getConfig().locale.prefix.replace('/', '');

      if (templatePageData) {
        const clone = replaceLinkPill(linkPill, templatePageData);
        if (clone) pageLinks.push(clone);
      } else {
        const searchParams = `tasks=${currentTasks}&tasksx=${currentTasksX}&phformat=${getMetadata('placeholder-format')}&topics=${topicsQuery}&q=${d.displayValue}&ckgid=${d.ckgID}`;
        const clone = linkPill.cloneNode(true);

        clone.innerHTML = clone.innerHTML.replace('/express/templates/default', `${prefix}/express/templates/search?${searchParams}`);
        clone.innerHTML = clone.innerHTML.replaceAll('Default', displayText);
        searchLinks.push(clone);
      }
    });

    if (leftTrigger) container.append(leftTrigger);
    pageLinks.concat(searchLinks).forEach((clone) => {
      container.append(clone);
    });
    if (rightTrigger) container.append(rightTrigger);

    if (container.children.length === 2) {
      const linkListData = [];

      window.linkLists.sheetData.forEach((row) => {
        if (row.parent === getMetadata('short-title')) {
          linkListData.push({
            childSibling: row['child-siblings'],
            shortTitle: getMetadata('short-title'),
            tasks: getMetadata('tasks'),
          });
        }
      });

      linkListData.forEach((d) => {
        const templatePageData = templatePages.find((p) => p.live === 'Y' && p.shortTitle === d.childSibling);
        const clone = replaceLinkPill(linkPill, templatePageData);
        if (clone) container.append(clone);
      });
    }
  }
}

async function lazyLoadLinklist() {
  await fetchLinkList();
  const linkList = document.querySelector('.link-list.fullwidth');

  if (linkList) {
    const linkListContainer = linkList.querySelector('p').parentElement;
    const linkListTemplate = linkList.querySelector('p').cloneNode(true);
    const linkListData = [];

    if (window.linkLists && window.linkLists.ckgData && getMetadata('short-title')) {
      window.linkLists.ckgData.forEach((row) => {
        linkListData.push({
          ckgID: row.ckgID,
          shortTitle: getMetadata('short-title'),
          tasks: row.parent,
          displayValue: row.displayValue,
        });
      });
    }

    await updateLinkList(linkListContainer, linkListTemplate, linkListData);
    linkList.style.visibility = 'visible';
  } else {
    linkList?.remove();
  }
}

async function lazyLoadSEOLinkList() {
  await fetchLinkList();
  const seoNav = document.querySelector('.seo-nav');

  if (seoNav) {
    const topTemplatesContainer = seoNav.querySelector('p').parentElement;
    const topTemplates = getMetadata('top-templates');
    if (topTemplates) {
      const topTemplatesTemplate = seoNav.querySelector('p').cloneNode(true);
      const topTemplatesData = topTemplates.split(', ').map((cs) => ({ childSibling: cs }));

      await updateSEOLinkList(topTemplatesContainer, topTemplatesTemplate, topTemplatesData);
      const hiddenDiv = seoNav.querySelector('div[style="visibility: hidden;"]');
      if (hiddenDiv) hiddenDiv.style.visibility = 'visible';
      initToggleTriggers(seoNav.querySelector('.carousel-container'));
    } else {
      topTemplatesContainer.innerHTML = '';
    }
  }
}

async function lazyLoadSearchMarqueeLinklist() {
  await fetchLinkList();
  const searchMarquee = document.querySelector('.search-marquee');

  if (searchMarquee) {
    const linkListContainer = searchMarquee.querySelector('.carousel-container > .carousel-platform');
    if (linkListContainer) {
      const linkListTemplate = linkListContainer.querySelector('p').cloneNode(true);

      const linkListData = [];

      if (window.linkLists && window.linkLists.ckgData && getMetadata('short-title')) {
        window.linkLists.ckgData.forEach((row) => {
          linkListData.push({
            ckgID: row.ckgID,
            shortTitle: getMetadata('short-title'),
            tasks: row.parent, // parent tasks
            displayValue: row.displayValue,
          });
        });
      }

      await updateLinkList(linkListContainer, linkListTemplate, linkListData);
      linkListContainer.parentElement.classList.add('appear');
      initToggleTriggers(searchMarquee.querySelector('.carousel-container'));
    }
  }
}

function hideAsyncBlocks() {
  const linkList = document.querySelector('.link-list.fullwidth');
  const seoNav = document.querySelector('.seo-nav');

  if (linkList) {
    linkList.style.visibility = 'hidden';
  }

  if (seoNav) {
    const topTemplatesContainer = seoNav.querySelector('p').parentElement;
    topTemplatesContainer.style.visibility = 'hidden';
  }
}

export default async function updateAsyncBlocks() {
  hideAsyncBlocks();
  // TODO: integrate memoization
  const showSearchMarqueeLinkList = getMetadata('show-search-marquee-link-list');
  if (document.body.dataset.device === 'desktop' && (!showSearchMarqueeLinkList || ['yes', 'true', 'on', 'Y'].includes(showSearchMarqueeLinkList))) {
    await lazyLoadSearchMarqueeLinklist();
  }
  await lazyLoadLinklist();
  await lazyLoadSEOLinkList();
}
