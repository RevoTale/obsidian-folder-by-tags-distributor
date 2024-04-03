import TokenType from "./token-type";
import {Token} from "./tokenizer";

const PolishNotation = (tokens: Token[]) => {
	const queue: Token[] = [];
	const stack: Token[] = [];
	tokens.forEach(token => {
		switch (token.type) {
			case TokenType.LITERAL:
				queue.unshift(token);
				break;
			case TokenType.BINARY_AND:
			case TokenType.BINARY_OR:
			case TokenType.OP_NOT:
			case TokenType.PAR_OPEN:
				stack.push(token);
				break;
			case TokenType.PAR_CLOSE:
				while (
					stack.length &&
					stack[stack.length - 1].type !== TokenType.PAR_OPEN
					) {
					const item = stack.pop()
					item && queue.unshift(item);
				}

				stack.pop();

				if (stack.length && stack[stack.length - 1].type === TokenType.OP_NOT) {
					const item = stack.pop()
					item && queue.unshift(item);
				}
				break;
			default:
				break;
		}
	});

	return (stack.length && [...stack.reverse(), ...queue]) || queue;
};

const PolishGenerator = function* (polish: Token[]): Generator<Token, Token> {
	for (let index = 0; index < polish.length - 1; index++) {
		yield polish[index];
	}

	return polish[polish.length - 1];
};

export {
	PolishNotation,
	PolishGenerator
};
