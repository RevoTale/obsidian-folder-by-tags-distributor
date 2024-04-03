import TokenType, {TokenTypeValue} from "./token-type";
import {Token} from "./tokenizer";

class ExpNode {
  constructor(public op:TokenTypeValue,public left :ExpNode|null=null, public right:ExpNode|null=null,public literal:string ='') {
  }

  isLeaf() {
    return this.op === TokenType.LEAF;
  }

  isAtomic() {
    return (
      this.isLeaf() || (this.op === TokenType.OP_NOT && this.left?.isLeaf())
    );
  }

  getLiteralValue() {
    return this.literal;
  }

  static CreateAnd(left:ExpNode|null, right:ExpNode|null) {
    return new ExpNode(TokenType.BINARY_AND, left, right);
  }

  static CreateNot(exp:ExpNode|null) {
    return new ExpNode(TokenType.OP_NOT, exp);
  }

  static CreateOr(left:ExpNode|null, right:ExpNode|null) {
    return new ExpNode(TokenType.BINARY_OR, left, right);
  }

  static CreateLiteral(lit:string) {
    return new ExpNode(TokenType.LEAF, null, null, lit);
  }
}

const make = (gen:Generator<Token,Token>):ExpNode|null => {
  const data = gen.next().value;

  switch (data.type) {
    case TokenType.LITERAL:
      return ExpNode.CreateLiteral(data.value);
    case TokenType.OP_NOT:
      return ExpNode.CreateNot(make(gen));
    case TokenType.BINARY_AND: {
      const left = make(gen);
      const right = make(gen);
      return ExpNode.CreateAnd(left, right);
    }
    case TokenType.BINARY_OR: {
      const left = make(gen);
      const right = make(gen);
      return ExpNode.CreateOr(left, right);
    }
  }
  return null;
};
const nodeEvaluator = (tree:ExpNode|null, literalEvaluator:(v:string)=>boolean):boolean => {
	if (tree === null) {
		return  literalEvaluator('');
	}
  if (tree.isLeaf()) {
    return literalEvaluator(tree.getLiteralValue());
  }

  if (tree.op === TokenType.OP_NOT) {
    return !nodeEvaluator(tree.left, literalEvaluator);
  }

  if (tree.op === TokenType.BINARY_OR) {
    return (
      nodeEvaluator(tree.left, literalEvaluator) ||
      nodeEvaluator(tree.right, literalEvaluator)
    );
  }

  if (tree.op === TokenType.BINARY_AND) {
    return (
      nodeEvaluator(tree.left, literalEvaluator) &&
      nodeEvaluator(tree.right, literalEvaluator)
    );
  }
  return false
};

export {
  make,
  nodeEvaluator
};
