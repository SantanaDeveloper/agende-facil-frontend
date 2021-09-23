export const getBase64 = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export const ConvertToBase64 = async images => {
  let data = [];
  await images.reduce((promiseChain, element) => {
    return promiseChain.then(
      () =>
        new Promise(resolve => {
          getBase64(element).then(res => {
            data.push(res);
            resolve();
          });
        }),
    );
  }, Promise.resolve());
  return data;
};
