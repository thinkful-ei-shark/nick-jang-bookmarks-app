import $ from 'jquery';
import api from './api';
import store from './store';
import cuid from 'cuid';

import deleteButton from '../images/delete-button.svg';
import editButton from '../images/edit-button.svg';
import editSubmitButton from '../images/edit-submit-button.svg';
import editCancelButton from '../images/edit-cancel-button.svg';

// Allow serializeJson on any jQuery object
$.fn.extend({
  serializeJson: function () {
    const formData = new FormData(this[0]);
    const o = {};
    formData.forEach((val, name) => o[name] = val);
    return JSON.stringify(o);
  }
});

/********** TEMPLATE GENERATION FUNCTIONS **********/

const generateButton = function (type, version) {
  let parseType = '';
  let classes = '';
  let innerHTML = '';
  let alt = {
    edit: 'An image of a pencil that is an edit button to edit the bookmark.',
    editSubmit: 'An image of a checkmark that that submits edits made to the bookmark.',
    editCancel: 'An image of an x that cancels edits made to the bookmark.',
    editSubmitNew: 'An image of a checkmark that adds the new bookmark.',
    editCancelNew: 'An image of an x that cancels the new bookmark.',
    delete: 'An image of a trash can that deletes the bookmark.',
    deleteMultiple: 'An image of a trash can that deletes the bookmark.',
  };

  if (!type) throw new Error('Given falsy value for type');
  parseType = type.split('-');

  // Create edit button
  if (parseType[0] === 'edit') {
    let editAlt = '';
    let img = '';
    if (!parseType[1]) {
      classes = 'class="edit-button edit-start-button js-edit-button item"';
      editAlt = alt.edit;
      img = editButton;
    } else {
      classes = `class="edit-button edit-${parseType[1]}-button js-edit-${parseType[1]}-button item"`;
      if (parseType[1] === 'submit') img = editSubmitButton;
      if (parseType[1] === 'cancel') img = editCancelButton;
      if (parseType[1] === 'submit') {
        if (version === 'bookmark') editAlt = alt.editSubmit;
        if (version === 'new-bookmark') editAlt = alt.editSubmitNew;
      } else if (parseType[1] === 'cancel') {
        if (version === 'bookmark') editAlt = alt.editCancel;
        if (version === 'new-bookmark') editAlt = alt.editCancelNew;
      }
    }

    innerHTML = `<img src="${img}" alt="${editAlt}" class="edit">`;
    // Create delete button
  } else if (parseType[0] === 'delete') {
    let deleteAlt = '';

    if (version === 'bookmark') deleteAlt = alt.delete;
    if (version === 'action-bar') deleteAlt = alt.deleteMultiple;

    classes = 'class="delete-button js-delete-button item"';
    innerHTML = `<img src="${deleteButton}" alt="${deleteAlt}" class="delete">`;
    // Create star button
  } else if (parseType[0] === 'star') {
    let id = cuid();
    let wordToNum = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
    let colored = version[0] ? 'colored' : 'not colored';
    // If the star is not a button, do not use the button tag
    if (!version[2]) {
      return `<div class="star-regular ${version[0]} item star" aria-label="${parseType[1]} star rating. 
        This star is ${colored}."></div>`;
    } else {
      // Use a radio button if it is a button
      classes = `class="star-button js-star-${parseType[1]} ${version[0]} item star"`;
      innerHTML = `<input type="radio" id="${type}-${id}" name="rating" class="hidden"
          value="${wordToNum[parseType[1]]}" aria-label="${parseType[1]} star rating. 
          This star is ${colored}." ${version[1]}>`;
    }
    // Create 'New' button
  } else if (parseType[0] === 'new') {
    classes = 'class="create-button js-create-button"';
    innerHTML = 'New';
  } else {
    throw new Error('Given invalid type for button creation.');
  }

  return `<button ${classes}>${innerHTML}</button>`;
};

const generateStarRating = function (rating, isButton) {
  let stars = '';
  ['star-one', 'star-two', 'star-three', 'star-four', 'star-five']
    .forEach((star, index) => {
      stars += generateButton(star,
        [index < rating ? 'star-colored' : '', index === rating - 1 ? 'checked' : '', isButton]
      );
    });

  return `
    <div class="stars group-row">
      ${stars}
    </div>`;
};

const generateNewBookmarkBody = function (id, url, desc) {
  let savedURL = '';
  let submitButton = generateButton('edit-submit', 'new-bookmark');
  let cancelButton = generateButton('edit-cancel', 'new-bookmark');

  if (url) savedURL = `value="${url}"`;

  return `
    <div class="bookmark-expanded">
      <div class="url group-row">
        <input type="text" name="url" id="new-url-${id}" aria-label="Enter a URL: " 
          placeholder="https://_______.___" ${savedURL}>
      </div>
      <div class="description group-row">
        <textarea id="new-desc-${id}" name="desc" aria-label="Enter a description: "
          placeholder="You can enter a description here.">${desc}</textarea>
      </div>
      <div class="submit-cancel group-row">
        ${submitButton}
        ${cancelButton}
        </div>
    </div>
  `;
};

const generateNewBookmarkHeader = function (id, title, rating) {
  let stars = generateStarRating(rating, true);
  let savedTitle = '';

  if (title) savedTitle = `value="${title}"`;

  return `
  <div class="bookmark-header new-header group-row">
    <div class="title-text-box group-row item">
      <input type="text" name="title" ${savedTitle} id="new-title-${id}" class="title item"
        aria-label="Enter a title: " placeholder="Enter a title here.">
    </div>
    <div class="new-header-stars group-row item">
      ${stars}
    </div>
  </div>`;
};

const generateNewBookmark = function (id, title, url, desc, rating) {
  let header = generateNewBookmarkHeader(id, title, rating);
  let body = generateNewBookmarkBody(id, url, desc);

  return `
    <li id="${id}" class="bookmark-wrapper js-new-bookmark new-bookmark">
      <form>
        ${header}
        ${body}
      </form>
    </li>`;
};

const generateNewBookmarksSection = function (newBookmarkData) {
  let newBookmarks = '';
  let createButton = generateButton('new');
  newBookmarks = newBookmarkData.reduce((elements, newBookmark) =>
    elements += generateNewBookmark(newBookmark.id, newBookmark.title,
      newBookmark.url, newBookmark.desc, newBookmark.rating), '');

  return `
    <section id="new-bookmarks">
      <div class="group-row">
        <h2 class="item">Bookmarks you're adding:</h2>
        ${createButton}
      </div>
      <ul>
        ${newBookmarks}
      </ul>
    </section>`;
};

const generateActionsBar = function (selectAll, newBookmarkExists) {
  let deleteButton = generateButton('delete', 'action-bar');
  let createButton = '';
  let marginLeft = '';

  if (!newBookmarkExists) {
    createButton = generateButton('new');
  } else {
    marginLeft = 'move-left';
  }

  return `
    <div class="group-row bookmarks-actions js-action-bar">
      <form class="item">
        <div class="select-style">
        <input type="checkbox" id="select-all" name="select-all" aria-label="Select all: " 
        value="select-all" ${selectAll ? 'checked' : ''}>
          <span class="check-all"></span>
        </div>
      </form>
      ${deleteButton}
      ${createButton}
      <form class="filter ${marginLeft} item">
        <select name="filter" id="filter" aria-label="Filter by: ">
          <option id="label-option" selected disabled>Filter by:</option>
          <option class="yellow-filter" value="5">☆☆☆☆☆</option>
          <option class="yellow-filter" value="4">☆☆☆☆</option>
          <option class="yellow-filter" value="3">☆☆☆</option>
          <option class="yellow-filter" value="2">☆☆</option>
          <option class="yellow-filter" value="1">☆</option>
          <option class="white-filter" value="0">Reset</option>
        </select>
      </form>
    </div>`;
};

const generateBookmarkBody = function (url, desc) {
  let descriptionValue = desc;

  if (!desc) descriptionValue = 'No description.';

  return `
    <div class="bookmark-expanded">
      <div class="visit-site group-row">
        <a href="${url}" target="_blank">Visit Site</a>
        <p>${url}</p>
      </div>
      <hr />
      <div class="description">
        <p class="description">${descriptionValue}</p>
      </div>
    </div>`;
};

const generateEditBookmarkBody = function (id, url, desc) {
  let editSubmitButton = generateButton('edit-submit', 'bookmark');
  let editCancelButton = generateButton('edit-cancel', 'bookmark');
  let deleteButton = generateButton('delete', 'bookmark');

  return `
    <div class="bookmark-expanded">
      <div class="url group-row">
        <input type="text" name="url" id="url-${id}" aria-label="Enter a URL: " 
          placeholder="https://_______.___" value="${url}">
      </div>
      <div class="description group-row">
        <textarea id="desc-${id}" name="desc" aria-label="Enter a description: "
          placeholder="You can enter a description here.">${desc}</textarea>
      </div>
      <div class="submit-cancel group-row">
        ${editSubmitButton}
        ${editCancelButton}
        ${deleteButton}
      </div>
    </div>`;
};

const generateBookmarkHeader = function (id, title, desc, rating, expanded) {
  let stars = '';
  let preview = '';
  let hidePreview = '';
  let editButton = generateButton('edit');
  let deleteButton = generateButton('delete', 'bookmark');

  stars = generateStarRating(rating, false);

  if (desc && !expanded) {
    preview = desc.substring(0, 40);
  } else {
    hidePreview = 'hidden';
  }

  return `
    <div class="bookmark-header active-header item group-row" tabindex="0">
      <h3 class="item">${title}</h3>
      <p class="preview item ${hidePreview}">${preview}</p>
      <div class="star-edit-delete group-row item">
        ${stars}
        ${editButton}
        ${deleteButton}
      </div>
    </div>`;
};

const generateEditBookmarkHeader = function (id, title, rating) {
  let stars = '';

  if (!rating) {
    stars = generateStarRating(0, true);
  } else {
    stars = generateStarRating(rating, true);
  }

  return `
    <div class="bookmark-header edit-header item group-row">
      <div class="title-text-box group-row item">
        <input type="text" name="title" id="title-${id}" aria-label="Enter a title: " 
        value="${title}" class="title item">
      </div>
      <div class="star-edit-delete group-row">
        ${stars}
      </div>
    </div>`;
};

const generateBookmark = function (id, title, url, desc, rating, expanded, edits, selected) {
  let header = '';
  let body = '';

  if (!Object.keys(edits).length) {
    header = generateBookmarkHeader(id, title, desc, rating, expanded, selected);
    if (expanded) body = generateBookmarkBody(url, desc);

    return `
      <li id="${id}" class="bookmark-wrapper js-bookmark view-bookmark">
        <div class="group-row header-wrapper">
          <div class="select-style">
            <input type="checkbox" id="select-${id}" name="select"
              aria-label="Select the bookmark: " ${selected ? 'checked' : ''}>
              <span class="checkcircle"></span>
          </div>
          ${header}
        </div>
        ${body}
      </li>`;
  } else {
    header = generateEditBookmarkHeader(id, edits.title, edits.rating, selected);
    body = generateEditBookmarkBody(id, edits.url, edits.desc);

    return `
      <li id="${id}" class="bookmark-wrapper js-edit-bookmark edit-bookmark">
          <form>
            <div class="group-row header-wrapper">
              <div class="select-style">
                <input type="checkbox" id="select-${id}" name="select"
                  aria-label="Select the bookmark: " ${selected ? 'checked' : ''}>
                <span class="checkcircle"></span>
              </div>
              ${header}
            </div>
            ${body}
          </form>
      </li>`;
  }
};

const generateBookmarksSection = function (bookmarkData, filter, selectAll, newBookmarkExists) {
  let actionBar = generateActionsBar(selectAll, newBookmarkExists);
  let bookmarks = '';
  let hide = '';

  if (!newBookmarkExists) hide = 'class="hidden"';

  bookmarks = bookmarkData.reduce((string, bookmark) => {
    if (bookmark.rating < filter) return string;
    string += generateBookmark(bookmark.id, bookmark.title, bookmark.url, bookmark.desc,
      bookmark.rating, bookmark.expanded, bookmark.edits, bookmark.selected);
    return string;
  }, '');

  return `
    <section id="bookmarks">
      <h2 ${hide}>Bookmarks:</h2>
      ${actionBar}
      <ul class="select-bookmarks">
        ${bookmarks}
      </ul>
    </section>`;
};

const generateErrorElement = function (error) {
  return `
    <aside class="error">
      <h3>${error.message}</h3>
    </aside>`;
};

/********** RENDER FUNCTION **********/

const render = function () {
  let filter = store.getFilter();
  let bookmarkData = store.getBookmarks();
  let newBookmarkData = store.getAdding();
  let selectAll = store.getSelectAll();
  let error = store.getError();
  let bookmarksHTML = '';
  let newBookmarksHTML = '';
  let errorHTML = '';

  if (newBookmarkData[0]) {
    newBookmarksHTML = generateNewBookmarksSection(newBookmarkData);
  }

  if (error && error.message) errorHTML = generateErrorElement(error);
  bookmarksHTML = generateBookmarksSection(bookmarkData, filter, selectAll, !!(newBookmarkData[0]));

  $('main').html(newBookmarksHTML + errorHTML + bookmarksHTML);
};

/********** EVENT HANDLER FUNCTIONS **********/

/**
 * Saves editting and new bookmark data,
 * so they are not lost on rerender.
 */
const handleTextInputKeyUp = function () {
  $('main').on('keyup', 'textarea, input[type="text"]', (event) => {
    let id = $(event.currentTarget).attr('id');
    let bookmarkType = $(event.currentTarget).closest('.bookmark-wrapper').attr('class');
    let bookmarkProperty = '';
    let bookmarkId = '';

    if (!id) throw new Error('Element id not found.');

    if (bookmarkType.includes('js-edit-bookmark')) {
      bookmarkType = 'edit';
      bookmarkProperty = id.split('-')[0];
      bookmarkId = id.split('-')[1];
    } else if (bookmarkType.includes('js-new-bookmark')) {
      bookmarkType = 'adding';
      bookmarkProperty = id.split('-')[1];
      bookmarkId = id.split('-')[2];
    }

    let update = { id: bookmarkId };
    update[bookmarkProperty] = document.getElementById(id).value;
    store.setTentativeData(update, bookmarkType);
  });
};

/**
 * Places an event listener on the select
 * all check box to select all bookmarks.
 */
const handleToggleSelectAllClick = function () {
  $('main').on('click', '#select-all', () => {
    store.toggleSelectAll();
    render();
  });
};

/**
 * Places an event listener on a bookmark's
 * checkbox to select it.
 */
const handleToggleCheckboxClick = function () {
  $('main').on('click', 'input[name="select"]', (event) => {
    event.stopPropagation();
    let id = $(event.currentTarget).closest('.bookmark-wrapper').attr('id');
    store.toggleSelected(id);
    render();
  });
};

/**
 * Places an event listener on the filter
 * drop down menu to select a rating to
 * filter by.
 */
const handleFilterSelectClick = function () {
  $('main').on('change', '#filter', () => {
    let filter = $('#filter').val();
    store.setFilter(filter);
    render();
  });
};

const setRating = function (id, type, classes) {
  if (type.includes('active-header')) {
    type = 'bookmark';
  } else if (type.includes('new-header')) {
    type = 'adding';
  } else if (type.includes('edit-header')) {
    type = 'edit';
  } else {
    throw new Error('Cannot find bookmark to submit.');
  }

  ['js-star-one', 'js-star-two', 'js-star-three', 'js-star-four', 'js-star-five']
    .forEach((star, index) => {
      if (classes && classes.includes(star)) {
        store.setRating(id, type, index + 1);
      }
    });
  render();
};

/** Places an event listener on the star
 * button select a rating.
*/
const handleStarButtonClick = function () {
  $('main').on('click', '.star-button', (event) => {
    event.preventDefault();
    event.stopPropagation();
    let id = $(event.currentTarget).closest('.bookmark-wrapper').attr('id');
    let type = $(event.currentTarget).closest('.bookmark-header').attr('class');
    let classes = $(event.currentTarget).attr('class');

    setRating(id, type, classes);
  });
};

/**
 * Places an event listener on bookmark
 * headers to toggle the expanded view
 */
const handleToggleExpand = function () {
  $('main').on('click', '.active-header', (event) => {
    console.log($('main :not(.js-edit-button) .active-header'));
    let id = $(event.currentTarget).closest('.js-bookmark').attr('id');
    store.toggleExpand(id);
    render();
  });

  $('main').on('keydown', '.active-header', (event) => {
    if (event.which === 13) {
      let id = $(event.currentTarget).closest('.js-bookmark').attr('id');
      store.toggleExpand(id);
      render();
    }
  });
};

const deleteAllBookmarks = function (ids) {
  ids.forEach(id => deleteBookmark(id));
};

/**
 * Place an event listener on the action bar
 * delete button to delete the selected 
 * bookmarks.
 */
const handleDeleteSelectedClick = function () {
  $('main').on('click', '.js-action-bar .js-delete-button', (event) => {
    event.preventDefault();
    let ids = $('.select-bookmarks input[checked]').closest('.js-bookmark, .js-edit-bookmark')
      .map(function () { return $(this).attr('id'); }).get();
    deleteAllBookmarks(ids);
  });
};

const deleteBookmark = function (id) {
  api.deleteBookmark(id)
    .then(() => {
      store.findAndDelete(id, 'bookmark');
      render();
    })
    .catch(error => {
      store.setError(error);
      render();
      store.resetError();
    });
};

/**
 * Place an event listener on a bookmark 
 * delete button to delete the bookmark.
 */
const handleDeleteButtonClick = function () {
  $('main').on('click', '.js-bookmark .js-delete-button, .js-edit-bookmark .js-delete-button', (event) => {
    event.preventDefault();
    event.stopPropagation();
    let id = $(event.currentTarget).closest('.js-bookmark, .js-edit-bookmark').attr('id');

    deleteBookmark(id);
  });

  $('main').on('keydown', '.js-bookmark .js-delete-button', (event) => {
    if (event.which === 13) {
      event.preventDefault();
      event.stopPropagation();
      let id = $(event.currentTarget).closest('.js-bookmark, .js-edit-bookmark').attr('id');

      deleteBookmark(id);
    }
  });
};

/**
 * Places an event listener on the edit
 * buttons to edit the bookmark.
 */
const handleEditButtonClick = function () {
  $('main').on('click', '.js-edit-button', (event) => {
    event.preventDefault();
    event.stopPropagation();
    let id = $(event.currentTarget).closest('.js-bookmark, .js-edit-bookmark').attr('id');

    store.toggleEditting(id);
    render();
  });

  $('main').on('keydown', '.js-edit-button', (event) => {
    if (event.which === 13) {
      event.preventDefault();
      event.stopPropagation();
      let id = $(event.currentTarget).closest('.js-bookmark, .js-edit-bookmark').attr('id');

      store.toggleEditting(id);
      render();
    }
  });
};

const submitNewBookmark = function (tentativeId, data) {
  api.putBookmark(data)
    .then((bookmark) => {
      store.addBookmark(tentativeId, bookmark);
      render();
    })
    .catch(error => {
      store.setError(error);
      render();
      store.resetError();
    });
};

const convertFormToObject = function (form) {
  const formData = new FormData(form[0]);
  const o = {};
  formData.forEach((val, name) => o[name] = val);
  return o;
};

const submitEdits = function (id, json, data) {
  data = convertFormToObject(data);

  // If selected, remove select key from json
  json = json.split('"select":"on",');
  if (json[1] && json[1].charAt(0) === ',') json[1].splice(1, 1);
  json = json.join('');

  api.patchBookmark(id, json)
    .then(() => {
      store.findAndUpdate(id, data);
      render();
    })
    .catch(error => {
      store.setError(error);
      render();
      store.resetError();
    });
};

/**
 * Places an event listener on the submit
 * buttons to submit edits made to a bookmark, 
 * or add a new bookmark.
 */
const handleSubmitButtonClick = function () {
  $('main').on('click', '.js-edit-submit-button', (event) => {
    event.preventDefault();
    let type = $(event.currentTarget).closest('.bookmark-wrapper').attr('class');
    let id = '';
    let data = {};
    let json = '';

    // Throw error if bookmark is not found in DOM,
    // otherwise get correct bookmark type.
    if (type.includes('js-edit-bookmark')) {
      type = '.js-edit-bookmark';
    } else if (type.includes('js-new-bookmark')) {
      type = '.js-new-bookmark';
    } else {
      throw new Error('Cannot find bookmark to submit.');
    }

    id = $(event.currentTarget).closest(type).attr('id');
    // Get the bookmark form data as a JSON
    data = $(event.currentTarget).closest(type + ' form');

    if (type.includes('js-edit-bookmark')) {
      json = data.serializeJson();
      submitEdits(id, json, data);
    } else if (type.includes('js-new-bookmark')) {
      json = data.serializeJson();
      submitNewBookmark(id, json);
    }
  });
};

/**
 * Places an event listener on the cancel
 * buttons to cancel edits being made to a
 * bookmark in the bookmarks section, or 
 * delete a bookmark form in the new 
 * bookmarks section. 
 */
const handleCancelButtonClick = function () {
  $('main').on('click', '.js-edit-cancel-button', (event) => {
    event.preventDefault();
    let type = $(event.currentTarget).closest('.bookmark-wrapper').attr('class');
    let id = $(event.currentTarget).closest('.bookmark-wrapper').attr('id');

    if (type.includes('js-edit-bookmark')) {
      store.toggleEditting(id);
    } else if (type.includes('js-new-bookmark')) {
      store.findAndDelete(id, 'adding');
    }
    render();
  });
};

/**
 * Places an event listener on the new
 * button to add a new bookmark form for
 * the user to fill out and submit.
 */
const handleNewButtonClick = function () {
  $('main').on('click', '.js-create-button', () => {
    store.addTentativeBookmark();
    render();
  });
};

const bindEventListeners = function () {
  handleNewButtonClick();
  handleCancelButtonClick();
  handleSubmitButtonClick();
  handleEditButtonClick();
  handleDeleteButtonClick();
  handleDeleteSelectedClick();
  handleToggleExpand();
  handleToggleCheckboxClick();
  handleStarButtonClick();
  handleFilterSelectClick();
  handleToggleSelectAllClick();
  handleTextInputKeyUp();
};

export default {
  render,
  bindEventListeners
};