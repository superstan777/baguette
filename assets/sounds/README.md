This folder is intended for app sound assets.

Suggested files:

- `correct.mp3` – short sound played when the user gives a correct answer
- `incorrect.mp3` – short sound played when the user gives an incorrect answer

Place your downloaded audio files here and rename them to match the names above.

In the code we can later load them with:

```ts
const correctSound = require("../assets/sounds/correct.mp3");
const incorrectSound = require("../assets/sounds/incorrect.mp3");
```

