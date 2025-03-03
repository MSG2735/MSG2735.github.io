# Deluxe Blackjack

A modern web-based blackjack game built with Next.js, React, Tailwind CSS, and Framer Motion. This game follows standard casino rules and provides a realistic blackjack experience in your browser.

![Deluxe Blackjack Screenshot]

## Features

- **Authentic Casino Rules**: Play blackjack with standard casino rules including splitting, doubling down, insurance, and more.
- **Responsive Design**: Enjoy the game on any device - desktop, tablet, or mobile.
- **Game Statistics**: Track your wins, losses, blackjacks, and overall profit.
- **Customizable Settings**: Adjust game rules and deck settings to your preference.
- **User Profiles**: Manage your virtual balance and game statistics.
- **Smooth Animations**: Experience beautiful animations powered by Framer Motion.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React Context API

## Game Rules

### Objective
The goal of blackjack is to beat the dealer's hand without going over 21.

### Card Values
- Face cards (J, Q, K) are worth 10 points
- Aces can be worth 1 or 11 points (automatically optimized for your best hand)
- All other cards are worth their face value

### Game Play
1. Place your bet
2. The dealer gives two cards to each player and themselves (one dealer card face down)
3. Players decide to Hit (take more cards) or Stand (keep current hand)
4. The dealer reveals their hidden card and must hit until they have 17 or higher
5. Closest to 21 without going over wins

### Special Actions
- **Double Down**: Double your bet and receive exactly one more card
- **Split**: If you have a matching pair, split them into two separate hands with separate bets
- **Insurance**: If the dealer shows an Ace, you can place an insurance bet (half your original bet) to protect against dealer blackjack

### Winning & Payouts
- Blackjack (Ace + 10/face card) pays 3:2
- Regular win pays 1:1 (even money)
- Insurance pays 2:1 if dealer has blackjack
- Push (tie) returns your bet

## Getting Started

### Prerequisites
- Node.js 16.8 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/deluxe-blackjack.git
cd deluxe-blackjack
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

This project is configured to automatically deploy to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment

If you want to deploy manually:

1. Build the project:
```bash
npm run build
```

2. Push the changes to GitHub:
```bash
git add .
git commit -m "Your commit message"
git push
```

3. The GitHub Actions workflow will automatically build and deploy your site to GitHub Pages.

4. Your site will be available at: https://msg2735.github.io/MSG2735.github.io/

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Card deck design inspired by classic casino playing cards
- Game rules based on standard Las Vegas blackjack rules
