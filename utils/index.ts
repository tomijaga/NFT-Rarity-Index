export function chooseRandomly(choices: any[]) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
