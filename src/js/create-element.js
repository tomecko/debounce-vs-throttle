export const createElement = (name, id) => {
  const element = document.createElement('div');
  element.setAttribute('id', `${name}-${id}`);
  element.setAttribute('class', 'timeline-item');
  element.innerHTML = String.fromCharCode(97 + id % 26);
  return element;
};
