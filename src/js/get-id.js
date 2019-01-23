export const getIdFactory = () => {
  let id = -1;
  return () => {
    id = id + 1;
    return id;
  };
}
