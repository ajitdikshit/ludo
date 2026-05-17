// bots.js - Ludo AI Logic

class LudoBot {
    /**
     * Calculates the best possible move for a bot based on probabilities and game state.
     */
    static getBestMove(gameData, color, diceValue, safeSpots, startOffsets) {
        let bestTokenIndex = -1;
        let bestScore = -Infinity;

        // Calculate a score for every single piece the bot owns
        for (let i = 0; i < 4; i++) {
            let currentPos = gameData.tokens[color][i];
            
            // Skip pieces that mathematically cannot move
            if (!this.canMove(currentPos, diceValue)) continue;

            // Evaluate how "good" this move is
            let score = this.evaluateMove(gameData, color, i, currentPos, diceValue, safeSpots, startOffsets);

            // Add a tiny fraction of randomness to naturally break ties (so bots aren't completely predictable)
            score += Math.random();

            if (score > bestScore) {
                bestScore = score;
                bestTokenIndex = i;
            }
        }

        return bestTokenIndex;
    }

    static canMove(pos, dice) {
        if (pos === -1) return dice === 6; // Needs a 6 to leave home
        if (pos + dice > 56) return false; // Overshoots home triangle
        return true;
    }

    static evaluateMove(gameData, color, tokenIndex, currentPos, dice, safeSpots, startOffsets) {
        let score = 0;
        let futurePos = currentPos === -1 ? 0 : currentPos + dice;

        // --- 1. LEAVING BASE (High Priority) ---
        if (currentPos === -1) return 50; 

        // --- 2. WINNING A PIECE (Top Priority) ---
        if (futurePos === 56) return 100; 

        // --- 3. PROGRESSION ---
        // Favour moving pieces that are further ahead on the board
        score += futurePos * 0.5; 

        let absFuturePos = (startOffsets[color] + futurePos) % 52;
        let absCurrentPos = (startOffsets[color] + currentPos) % 52;

        // --- 4. ENTERING HOME STRETCH ---
        // It is completely safe from captures here, great move
        if (futurePos >= 51 && currentPos <= 50) score += 30;

        // --- 5. JUMPING TO SAFE POINT ---
        if (safeSpots.includes(absFuturePos) && futurePos <= 50) {
            score += 35; // Excellent defensive move
        }

        // --- 6. CHASING & CAPTURING (Aggressive Logic) ---
        if (futurePos <= 50 && !safeSpots.includes(absFuturePos)) {
            ['red', 'green', 'yellow', 'blue'].forEach(otherColor => {
                if (otherColor === color) return; // Don't care about our own pieces
                
                gameData.tokens[otherColor].forEach((otherPos) => {
                    if (otherPos >= 0 && otherPos <= 50) {
                        let otherAbsPos = (startOffsets[otherColor] + otherPos) % 52;
                        if (absFuturePos === otherAbsPos) {
                            score += 80; // Massive bonus for capturing
                            score += otherPos; // Extra bonus if we capture an enemy who is close to winning
                        }
                    }
                });
            });
        }

        // --- 7. PLAYING DEFENSIVE (Fleeing Danger) ---
        if (currentPos >= 0 && currentPos <= 50 && !safeSpots.includes(absCurrentPos)) {
            if (this.isThreatened(absCurrentPos, color, gameData, startOffsets)) {
                score += 45; // High priority to run away if someone is right behind us
            }
        }

        // --- 8. AVOIDING DANGER (Don't be stupid) ---
        // If the new square puts us right in front of an enemy, penalize this move
        if (futurePos <= 50 && !safeSpots.includes(absFuturePos)) {
            if (this.isThreatened(absFuturePos, color, gameData, startOffsets)) {
                score -= 60; // Huge penalty for walking into a trap
            }
        }

        return score;
    }

    // Checks if an enemy piece is 1 to 6 squares right behind this position
    static isThreatened(absPos, myColor, gameData, startOffsets) {
        let isThreatened = false;
        
        ['red', 'green', 'yellow', 'blue'].forEach(otherColor => {
            if (otherColor === myColor) return;
            
            gameData.tokens[otherColor].forEach(otherPos => {
                if (otherPos >= 0 && otherPos <= 50) {
                    let otherAbsPos = (startOffsets[otherColor] + otherPos) % 52;
                    
                    // Distance formula for circular track
                    let distanceBehind = absPos - otherAbsPos;
                    if (distanceBehind < 0) distanceBehind += 52;
                    
                    if (distanceBehind >= 1 && distanceBehind <= 6) {
                        isThreatened = true;
                    }
                }
            });
        });
        
        return isThreatened;
    }
}