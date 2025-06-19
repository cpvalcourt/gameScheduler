import { Game } from '../models/game.model';

interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export const validateGame = (game: Partial<Game>): ValidationResult => {
    const errors: string[] = [];

    if (!game.name) {
        errors.push('Name is required');
    }

    if (!game.sport_type) {
        errors.push('Sport type is required');
    }

    if (!game.date) {
        errors.push('Date is required');
    }

    if (!game.time) {
        errors.push('Time is required');
    }

    if (!game.location) {
        errors.push('Location is required');
    }

    if (game.min_players === undefined || game.min_players < 0) {
        errors.push('Min players must be a non-negative number');
    }

    if (game.max_players === undefined || game.max_players < 0) {
        errors.push('Max players must be a non-negative number');
    }

    if (game.min_players !== undefined && game.max_players !== undefined && game.min_players > game.max_players) {
        errors.push('Min players cannot be greater than max players');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}; 