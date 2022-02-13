import './styles.scss';
import { getNodeById } from './utils';

const form: HTMLElement = getNodeById('form');
const input: HTMLElement = getNodeById('input');
const toDownload: HTMLElement = getNodeById('toDownload');
const browseText: HTMLElement = getNodeById('browseText');

input.addEventListener('input', () => {
  browseText.innerText = 'Now Submit!';
})

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const file = input.files[0];
  const formData = new FormData();
  formData.append('file', file);
  await fetch(file.name, {
    method: 'POST',
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if(data.links.length === 1) {
        const fileLink = document.createElement('a');
        fileLink.href = [...data.links];
        fileLink.innerText = `You can download your file here.`;
        toDownload.appendChild(fileLink);
      } else {
        const aLarge = document.createElement('a');
        const aMedium = document.createElement('a');
        const aSmall = document.createElement('a');
        const image = <HTMLImageElement>document.createElement('img');
        image.src = data.links[0];

        [aLarge.href, aMedium.href, aSmall.href] = [...data.links];
        const div = document.createElement('div');
        div.innerText = 'You can download your images in:'
        aLarge.innerText = `[Large format - 2048 x 2048]`;
        aMedium.innerText = `[Medium format - 1024 x 1024]`;
        aSmall.innerText = `[Thumb - 300x300]`;
        toDownload.appendChild(div)
          .appendChild(aLarge)
          .appendChild(aMedium)
          .appendChild(aSmall)
          .appendChild(image)
          .scrollIntoView({block: "center", behavior: "smooth"});
        browseText.innerText = 'Browse files';
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
