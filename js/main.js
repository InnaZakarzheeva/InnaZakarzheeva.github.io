var game;
// Создание объекта game (600 пикселей в ширину и 450 пикселей в высоту)
game = new Phaser.Game(500, 650, Phaser.AUTO, '');
// Первый параметр - название нашего состояния
// Второй параметр - объект, который будет хранить методы нашего состояния
game.state.add('Menu', Menu);
// Добавляем состояние "Игра"
game.state.add('Game', Start);
game.state.add('GameOver', TimeUp);
game.state.start('Menu');