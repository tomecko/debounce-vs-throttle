export const handleDOM = name => values => {
  values.forEach(({ element, progress }) => {
    if (!document.getElementById(element.getAttribute('id'))) {
      document.getElementById(`timeline-${name}`).append(element);
    }
    element.setAttribute('style', `bottom: ${progress}%`);
  });
  const idsToShow = values.map(({ element }) => element.getAttribute('id'));
  Array.from(document
    .getElementById(`timeline-${name}`)
    .getElementsByClassName('timeline-item'))
    .forEach(item => {
      if (!idsToShow.includes(item.getAttribute('id'))) {
        item.parentNode.removeChild(item);
      }
    })
};
