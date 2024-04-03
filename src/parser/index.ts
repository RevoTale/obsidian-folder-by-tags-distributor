import {make, nodeEvaluator} from "./node";
import {PolishGenerator, PolishNotation} from "./polish";
import Tokenizer from "./tokenizer";

const parse = (exp: string, literalChecker: (cond: string) => boolean): boolean => {
	const tokens = Tokenizer(exp);
	const polish = PolishNotation(tokens);
	const gen = PolishGenerator(polish);
	const tree = make(gen);
	return nodeEvaluator(tree, literalChecker);
};
export {parse}
