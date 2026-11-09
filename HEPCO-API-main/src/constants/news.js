module.exports = {
  NEWS_TYPES: ['news', 'shareholders', 'service', 'about'],
  NEWS_METADATA_FIELDS: ['summary', 'category', 'documentType', 'publishYear', 'attachments', 'relatedIds', 'slug'],
  NEWS_MAX_PAGE_SIZE: 100,
  NEWS_SORTS: { title_asc: { title: 'asc' }, title_desc: { title: 'desc' }, created_at_asc: { id: 'asc' }, created_at_desc: { id: 'desc' } },
};
