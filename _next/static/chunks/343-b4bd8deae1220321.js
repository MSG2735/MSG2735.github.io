"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[343],{1343:(e,a,t)=>{t.d(a,{GameProvider:()=>w,I:()=>E});var l=t(5155),r=t(2115),n=t(3829),s=t(5556);let c={cardDeal:new s.Howl({src:["/sounds/card-deal.mp3"],volume:.1}),cardFlip:new s.Howl({src:["/sounds/card-flip.mp3"],volume:.1}),chipStack:new s.Howl({src:["/sounds/chip-stack.mp3"],volume:.1}),win:new s.Howl({src:["/sounds/win-casino-new.mp3"],volume:.1}),lose:new s.Howl({src:["/sounds/lose-casino-new.mp3"],volume:.1}),push:new s.Howl({src:["/sounds/push.mp3"],volume:.1}),blackjack:new s.Howl({src:["/sounds/blackjack.mp3"],volume:.1}),volumeChange:new s.Howl({src:["/sounds/volume-change.mp3"],volume:.1,preload:!0})},u={cardDeal:.1,cardFlip:.1,chipStack:.1,win:.1,lose:.1,push:.1,blackjack:.1,volumeChange:.1};class o{applyVolumeToAllSounds(){Object.entries(c).forEach(e=>{let[a,t]=e,l=u[a];t.volume(l*this.volume)})}play(e){this.enabled&&c[e].play()}playVolumeChange(){this.enabled&&(this.volumeChangeTimeout&&clearTimeout(this.volumeChangeTimeout),this.volumeChangeTimeout=setTimeout(()=>{c.volumeChange.play(),this.volumeChangeTimeout=null},50))}setVolume(e){this.volume=e,this.applyVolumeToAllSounds(),this.playVolumeChange()}enable(){this.enabled=!0,localStorage.setItem("blackjack-soundEffects","true")}disable(){this.enabled=!1,localStorage.setItem("blackjack-soundEffects","false")}constructor(){this.enabled=!1,this.volume=.5,this.volumeChangeTimeout=null,this.enabled="false"!==localStorage.getItem("blackjack-soundEffects"),this.volume=parseFloat(localStorage.getItem("blackjack-volume")||"0.5"),this.applyVolumeToAllSounds()}}let d=new o;window.soundManager=d;let i={deck:[],dealer:{cards:[],bet:0,doubleDown:!1,insurance:!1,insuranceBet:0,isStanding:!1,isBusted:!1,isBlackjack:!1,isSplit:!1},player:{hands:[{cards:[],bet:0,doubleDown:!1,insurance:!1,insuranceBet:0,isStanding:!1,isBusted:!1,isBlackjack:!1,isSplit:!1}],balance:1e3,name:"Player",id:"1"},currentHandIndex:0,gamePhase:"betting",message:"Place your bet to start the game.",gameResult:null},p={wins:0,losses:0,pushes:0,blackjacks:0,winRate:0,profit:0},h=[],y=[],g=(0,r.createContext)(void 0);function m(e,a){switch(a.type){case"PLACE_BET":{let t=a.payload;if(t<=0||t>e.player.balance)return{...e,message:"Invalid bet amount."};return null==d||d.play("chipStack"),{...e,player:{...e.player,hands:[{cards:[],bet:t,doubleDown:!1,insurance:!1,insuranceBet:0,isStanding:!1,isBusted:!1,isBlackjack:!1,isSplit:!1}],balance:e.player.balance-t},currentHandIndex:0,gamePhase:"playerTurn",message:"Dealing cards...",gameResult:null}}case"DEAL_INITIAL_CARDS":{let a,t,l,r,s=(0,n.Ul)(6);[a,s]=(0,n.xw)(s,!0),null==d||d.play("cardDeal"),[t,s]=(0,n.xw)(s,!0),null==d||d.play("cardDeal"),[l,s]=(0,n.xw)(s,!0),null==d||d.play("cardDeal"),[r,s]=(0,n.xw)(s,!1),null==d||d.play("cardDeal");let c={...e.player.hands[0],cards:[a,l],isBlackjack:(0,n.ne)({cards:[a,l]})},u={cards:[t,r],bet:0,doubleDown:!1,insurance:!1,insuranceBet:0,isStanding:!1,isBusted:!1,isBlackjack:(0,n.ne)({cards:[t,r]}),isSplit:!1},o=c.isBlackjack,i=u.isBlackjack,p=e.gamePhase,h=a.rank===l.rank?"Hit, stand, double down, or split.":"Hit, stand, or double down.",y=null;if(o){if(i)p="gameOver",h="Both have blackjack - Push (Bet returned)",y="push";else{let e=1.5*c.bet;p="gameOver",h="Blackjack (+$".concat(e,")"),y="blackjack"}}else i?(p="gameOver",h="Dealer has blackjack (-$".concat(c.bet,")"),y="lose"):p="playerTurn";return{...e,deck:s,player:{...e.player,hands:[c]},dealer:u,gamePhase:p,message:h,gameResult:y}}case"HIT":{let a;let t=e.currentHandIndex,l=e.player.hands[t],r=[...e.deck];[a,r]=(0,n.xw)(r,!0),null==d||d.play("cardDeal");let s=[...l.cards,a],c={...l,cards:s,isBusted:(0,n.U_)({...l,cards:s})},u=[...e.player.hands];u[t]=c;let o=e.gamePhase,i=e.message;if(c.isBusted){if(u.every(e=>e.isBusted||e.isStanding))u.every(e=>e.isBusted)?(o="evaluating",i="All hands busted (-$".concat(u.reduce((e,a)=>e+a.bet,0),")")):(o="dealerTurn",i="Busted - Dealer's turn");else{let e=t+1;e<u.length?(o="playerTurn",i="Playing ".concat(e+1).concat(A(e+1)," hand. Hit, stand, or double down.")):(o="dealerTurn",i="Dealer's turn.")}}else{let{total:e}=(0,n.Zd)(c);if(21===e){if(u[t]={...c,isStanding:!0},u.every(e=>e.isStanding||e.isBusted))o="dealerTurn",i="Player stands with 21. Dealer's turn.";else{let e=t+1;e<u.length&&(o="playerTurn",i="Playing ".concat(e+1).concat(A(e+1)," hand. Hit, stand, or double down."))}}else i="Hit or Stand?"}return{...e,deck:r,player:{...e.player,hands:u},currentHandIndex:"playerTurn"===o&&i.includes("Playing")&&i.includes("hand")?t+1:t,gamePhase:o,message:i}}case"STAND":{let a=e.currentHandIndex,t=[...e.player.hands];t[a]={...t[a],isStanding:!0};let l=t.every(e=>e.isStanding||e.isBusted),r=e.gamePhase,n=e.message,s=a;return l?(r="dealerTurn",n="Dealer's turn."):(s=a+1)<t.length?(r="playerTurn",n="Playing ".concat(s+1).concat(A(s+1)," hand. Hit, stand, or double down.")):(r="dealerTurn",n="Dealer's turn."),{...e,player:{...e.player,hands:t},currentHandIndex:"playerTurn"===r?s:a,gamePhase:r,message:n}}case"DOUBLE_DOWN":{let a;let t=e.currentHandIndex,l=e.player.hands[t],r=l.bet;if(2!==l.cards.length)return{...e,message:"Can only double down on first two cards."};if(e.player.balance<r)return{...e,message:"Not enough balance to double down."};if(l.isSplit&&!n.L6.allowDoubleAfterSplit)return{...e,message:"Doubling down after split is not allowed."};let s=[...e.deck];[a,s]=(0,n.xw)(s,!0);let c=[...l.cards,a],u={...l,cards:c,bet:2*r,doubleDown:!0,isStanding:!0,isBusted:(0,n.U_)({...l,cards:c})},o=[...e.player.hands];o[t]=u;let d=e.gamePhase,i=e.message,p=t;return o.every(e=>e.isStanding||e.isBusted)?(d="dealerTurn",i="Dealer's turn."):(p=t+1)<o.length?(d="playerTurn",i="Playing ".concat(p+1).concat(A(p+1)," hand. Hit, stand, or double down.")):(d="dealerTurn",i="Dealer's turn."),{...e,deck:s,player:{...e.player,hands:o,balance:e.player.balance-r},gamePhase:d,message:i,currentHandIndex:p}}case"SPLIT":{let a,t;let l=e.player.hands[e.currentHandIndex];if(2!==l.cards.length||l.cards[0].rank!==l.cards[1].rank)return{...e,message:"This hand cannot be split."};if(e.player.balance<l.bet)return{...e,message:"Not enough balance to split."};let r=l.cards[0],s=l.cards[1],c=[...e.deck];[a,c]=(0,n.xw)(c,!0),[t,c]=(0,n.xw)(c,!0);let u={cards:[r,a],bet:l.bet,doubleDown:!1,insurance:!1,insuranceBet:0,isStanding:!1,isBusted:!1,isBlackjack:!1,isSplit:!0},o={cards:[s,t],bet:l.bet,doubleDown:!1,insurance:!1,insuranceBet:0,isStanding:!1,isBusted:!1,isBlackjack:!1,isSplit:!0},d=[...e.player.hands];return d.splice(e.currentHandIndex,1,u,o),{...e,deck:c,player:{...e.player,hands:d,balance:e.player.balance-l.bet},gamePhase:"playerTurn",message:"Playing 1st hand. Hit, stand, or double down."}}case"DEALER_PLAY":{let a=e.dealer.cards.map((e,a)=>1===a?(null==d||d.play("cardFlip"),{...e,faceUp:!0}):e),t={...e.dealer,cards:a,isBlackjack:(0,n.ne)({...e.dealer,cards:a})},l=[...e.deck];for(;(0,n.Zd)(t).total<17;){let e;[e,l]=(0,n.xw)(l,!0),t.cards.push(e)}return t.isBusted=(0,n.U_)(t),{...e,deck:l,dealer:t,gamePhase:"evaluating",message:"Evaluating hands..."}}case"EVALUATE_HANDS":{let a=e.player.hands,t=e.dealer,l=0,r=e.gameResult;if(1===a.length){let{result:e,payout:s}=(0,n.Ld)(a[0],t,n.L6);l=s,r=e}else{for(let e of a){let{payout:a}=(0,n.Ld)(e,t,n.L6);l+=a}r=null}let s="";if(1===a.length){let e=a[0].bet,t=l-e;switch(r){case"win":null==d||d.play("win"),s="You win (+$".concat(t,")");break;case"lose":null==d||d.play("lose"),s="You lose (-$".concat(e,")");break;case"push":null==d||d.play("push"),s="Push (Bet returned)";break;case"blackjack":null==d||d.play("blackjack"),s="Blackjack (+$".concat(t,")")}}else{let a=l-e.player.hands.reduce((e,a)=>e+a.bet,0);a>0?(null==d||d.play("win"),s="You win (+$".concat(a,")")):a<0?(null==d||d.play("lose"),s="You lose (-$".concat(Math.abs(a),")")):(null==d||d.play("push"),s="Push (Bet returned)")}return{...e,player:{...e.player,balance:e.player.balance+l},gamePhase:"gameOver",message:s,gameResult:r}}case"NEW_GAME":return{...i,player:{...i.player,balance:e.player.balance}};case"CLEAR_BET":{let a=e.player.hands[0].bet;return{...e,player:{...e.player,hands:[{...e.player.hands[0],bet:0}],balance:e.player.balance+a},message:"Bet cleared. Place your bet to start the game."}}case"UPDATE_BALANCE":{let t=a.payload;return{...e,player:{...e.player,balance:t}}}case"ADD_FUNDS":{let t=a.payload;return{...e,player:{...e.player,balance:e.player.balance+t}}}case"RESET_ALL_DATA":return i;default:return e}}function b(e,a){switch(a.type){case"EVALUATE_HANDS":{if(!a.gameState)return e;let{gameResult:t,player:l,dealer:r}=a.gameState,{wins:s,losses:c,pushes:u,blackjacks:o,profit:d}=e;if(l.hands.length>1)l.hands.forEach(e=>{let{result:a,payout:t}=(0,n.Ld)(e,r,n.L6),l=t-e.bet;"win"===a?(s++,d+=l):"lose"===a?(c++,d+=l):"push"===a?u++:"blackjack"===a&&(s++,o++,d+=l)});else{if(!t)return e;let a=l.hands[0],{payout:i}=(0,n.Ld)(a,r,n.L6),p=i-a.bet;"win"===t?(s++,d+=p):"lose"===t?(c++,d+=p):"push"===t?u++:"blackjack"===t&&(s++,o++,d+=p)}let i=s+c+u,p=i>0?s/i*100:0;return{wins:s,losses:c,pushes:u,blackjacks:o,winRate:p,profit:d}}case"NEW_GAME":default:return e;case"LOAD_STATS":{let{wins:e,losses:t,pushes:l,blackjacks:r,profit:n}=a.payload,s=e+t+l;return{wins:e,losses:t,pushes:l,blackjacks:r,winRate:s>0?e/s*100:0,profit:n}}case"RESET_STATS":return p}}function k(e,a){return"UPDATE_SETTINGS"===a.type?{...e,...a.payload}:e}function f(e,a){switch(a.type){case"ADD_MATCH":return[a.payload,...e];case"CLEAR_HISTORY":return[];case"LOAD_HISTORY":return a.payload;default:return e}}function S(e,a){switch(a.type){case"ADD_PURCHASE":return[a.payload,...e];case"CLEAR_PURCHASES":return[];case"LOAD_PURCHASES":return a.payload;default:return e}}function w(e){let{children:a}=e,[t,s]=(0,r.useReducer)(m,function(){try{let e=localStorage.getItem("blackjack-balance");if(e){let a=parseInt(e);return{...i,player:{...i.player,balance:a}}}}catch(e){console.error("Error loading balance from localStorage:",e)}return i}()),[c,u]=(0,r.useReducer)(b,function(){try{let e=localStorage.getItem("blackjack-stats");if(e)return JSON.parse(e)}catch(e){console.error("Error loading stats from localStorage:",e)}return p}()),[o,d]=(0,r.useReducer)(f,function(){try{let e=localStorage.getItem("blackjack-history");if(e)return JSON.parse(e).map(e=>({...e,date:new Date(e.date)}))}catch(e){console.error("Error loading match history from localStorage:",e)}return h}()),[w,E]=(0,r.useReducer)(S,function(){try{let e=localStorage.getItem("blackjack-purchase-history");if(e)return JSON.parse(e).map(e=>({...e,date:new Date(e.date)}))}catch(e){console.error("Error loading purchase history from localStorage:",e)}return y}()),[A,D]=(0,r.useReducer)(k,function(){try{let e=localStorage.getItem("blackjack-settings");if(e)return JSON.parse(e)}catch(e){console.error("Error loading settings from localStorage:",e)}return n.L6}()),[T,v]=(0,r.useState)(!1),B=(0,r.useCallback)(e=>{"ADD_FUNDS"===e.type&&E({type:"ADD_PURCHASE",payload:{id:Date.now().toString(),date:new Date,amount:e.payload}}),s(e)},[s]);(0,r.useEffect)(()=>{v(!0)},[]),(0,r.useEffect)(()=>{"evaluating"===t.gamePhase&&s({type:"EVALUATE_HANDS"})},[t.gamePhase]),(0,r.useEffect)(()=>{if("dealerTurn"===t.gamePhase){let e=setTimeout(()=>{s({type:"DEALER_PLAY"})},1e3);return()=>clearTimeout(e)}},[t.gamePhase]),(0,r.useEffect)(()=>{"gameOver"===t.gamePhase&&(t.player.hands.forEach((e,a)=>{let{result:l,payout:r}=(0,n.Ld)(e,t.dealer,A),s=r-e.bet;d({type:"ADD_MATCH",payload:{id:"".concat(Date.now(),"-").concat(a),date:new Date,result:l,playerCards:[...e.cards],dealerCards:[...t.dealer.cards],bet:e.bet,payout:r,profit:s}})}),u({type:"EVALUATE_HANDS",gameState:t}))},[t.gamePhase]),(0,r.useEffect)(()=>{T&&(localStorage.setItem("blackjack-game-state",JSON.stringify(t)),localStorage.setItem("blackjack-game-stats",JSON.stringify(c)),localStorage.setItem("blackjack-settings",JSON.stringify(A)),localStorage.setItem("blackjack-history",JSON.stringify(o)),localStorage.setItem("blackjack-purchase-history",JSON.stringify(w)))},[t.player.balance,c,A,o,w,T]);let P=()=>{s({type:"RESET_ALL_DATA"}),u({type:"RESET_STATS"}),d({type:"CLEAR_HISTORY"}),E({type:"CLEAR_PURCHASES"})};return(0,r.useEffect)(()=>{t===i&&P()},[t]),(0,l.jsx)(g.Provider,{value:{gameState:t,gameStats:c,matchHistory:o,purchaseHistory:w,settings:A,dispatch:B,updateSettings:e=>D({type:"UPDATE_SETTINGS",payload:e})},children:a})}function E(){let e=(0,r.useContext)(g);if(void 0===e)throw Error("useGame must be used within a GameProvider");return e}function A(e){return 1===e?"st":2===e?"nd":3===e?"rd":"th"}},3829:(e,a,t)=>{t.d(a,{L6:()=>l,Ld:()=>i,U_:()=>u,Ul:()=>r,Zd:()=>s,ne:()=>c,sN:()=>d,xw:()=>n,zy:()=>o});let l={deckCount:6,blackjackPayout:1.5,dealerStandsOnSoft17:!0,allowSurrender:!0,allowDoubleAfterSplit:!0,minimumBet:5,maximumBet:1e3,volume:.5},r=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:6,a=["hearts","diamonds","clubs","spades"],t=["A","2","3","4","5","6","7","8","9","10","J","Q","K"],l=[];for(let r=0;r<e;r++)for(let e of a)for(let a of t)l.push({suit:e,rank:a,faceUp:!0});for(let e=l.length-1;e>0;e--){let a=Math.floor(Math.random()*(e+1));[l[e],l[a]]=[l[a],l[e]]}return l},n=function(e){let a=!(arguments.length>1)||void 0===arguments[1]||arguments[1];if(0===e.length)throw Error("Deck is empty");let t=[...e];return[{...t.pop(),faceUp:a},t]},s=e=>{let a=0,t=0,l=!1;return e.cards.forEach(e=>{e.faceUp&&("A"===e.rank?t+=1:["J","Q","K"].includes(e.rank)?a+=10:a+=parseInt(e.rank))}),t>0&&(a+11+(t-1)<=21?(a+=11+(t-1),l=!0):a+=t),{total:a,isSoft:l}},c=e=>{if(2!==e.cards.length)return!1;let{total:a}=s(e);return 21===a},u=e=>{let{total:a}=s(e);return a>21},o=e=>{if(2!==e.cards.length)return!1;let[a,t]=e.cards;return a.rank===t.rank},d=(e,a,t)=>2===e.cards.length&&!(a<e.bet)&&(!e.isSplit||!t||!!t.allowDoubleAfterSplit),i=(e,a,t)=>{let l=s(e).total,r=s(a).total;return l>21?{result:"lose",payout:0}:r>21?{result:"win",payout:2*e.bet}:c(e)&&!c(a)?{result:"blackjack",payout:e.bet*(1+t.blackjackPayout)}:!c(e)&&c(a)?{result:"lose",payout:0}:c(e)&&c(a)?{result:"push",payout:e.bet}:l>r?{result:"win",payout:2*e.bet}:l<r?{result:"lose",payout:0}:{result:"push",payout:e.bet}}}}]);