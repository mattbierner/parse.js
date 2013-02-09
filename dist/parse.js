/* THIS FILE IS AUTO GENERATED from lib/parse.kep
 * DO NOT EDIT*/

define(["stream/stream"], function(stream) {
    "use strict";
    var join = Array.prototype.join;
    var map = Array.prototype.map;
    var reduceRight = Array.prototype.reduceRight;
    var bind = function(f) {
        return ((arguments.length === 1) ? f : f.bind.apply(f, arguments));
    };
    var identity = function(x) {
        return x;
    };
    var constant = bind(bind, identity);
    var throwConstant = function(err) {
        return function() {
throw err;        };
    };
    var eq = function(x, y) {
        return (x === y);
    };
    var uniqueParserId = function() {
        return Math.random();
    };
    var cont = function(f, args) {
        var c = [f, args];
        (c._next = true);
        return c;
    };
    var trampoline = function(f) {
        var value = f;
while((value && value._next)){
            (value = value[0].apply(undefined, value[1]));
        }
        return value;
    };
    var Memoer = function(id, val, state, delegate) {
        (this.id = id);
        (this.val = val);
        (this.state = state);
        (this.delegate = delegate);
    };
    (Memoer.lookup = function(cell, id, state) {
for(        var m = cell;
 m;(m = m.delegate)){
            if(((m.id === id) && m.state.eq(state))){
                return m.val;
            }
        }
        return null;
    });
    (Memoer.update = function(m, id, val, state) {
        return new Memoer(id, val, state, m);
    });
    var Position = function(i) {
        (this.index = i);
    };
    (Position.prototype.increment = function(tok) {
        return new Position((this.index + 1));
    });
    (Position.prototype.toString = function() {
        return ("" + this.index);
    });
    (Position.prototype.compare = function(pos) {
        return (this.index - pos.index);
    });
    var InputState = function(input, pos) {
        (this.input = input);
        (this.pos = pos);
    };
    (InputState.prototype.next = function(tok) {
        return (this._next || (this._next = new InputState(stream.rest(this.input), this.pos.increment(tok))));
    });
    (InputState.prototype.eq = function(state) {
        return (this.pos.compare(state.pos) === 0);
    });
    var ParseError = function(pos, messages) {
        (this._messages = messages);
        (this.pos = pos);
    };
    (ParseError.prototype = new Error());
    (ParseError.prototype.constructor = ParseError);
    (ParseError.prototype.name = "ParseError");
    Object.defineProperties(ParseError.prototype, {message:{get:function() {
        var messages = this.messages;
        return (((("At position:" + this.pos) + " [") + (messages ? join.call(messages, ", ") : "")) + "]");
    }},messages:{get:function() {
        return this._messages;
    }}});
    var MultipleError = function(e1, e2) {
        (this.e1 = e1);
        (this.e2 = e2);
        ParseError.call(this, e1.pos);
    };
    (MultipleError.prototype = new ParseError());
    (MultipleError.prototype.constructor = MultipleError);
    (MultipleError.prototype.name = "MultipleError");
    Object.defineProperty(MultipleError.prototype, "messages", {get:function() {
        var e1Msg = this.e1.messsage;
        return (e1Msg ? [e1Msg, this.e2.message] : [this.e2.message]);
    }});
    var UnknownError = function(pos) {
        ParseError.call(this, pos, ["Error"]);
    };
    (UnknownError.prototype = new ParseError());
    (UnknownError.prototype.constructor = UnknownError);
    (UnknownError.prototype.name = "UnknownError");
    var UnexpectError = function(pos, msg) {
        ParseError.call(this, pos, (msg ? [("Unexpected " + msg)] : msg));
    };
    (UnexpectError.prototype = new ParseError());
    (UnexpectError.prototype.constructor = UnexpectError);
    (UnexpectError.prototype.name = "UnexpectError");
    var ExpectError = function(pos, msg) {
        ParseError.call(this, pos, [("Expected " + (msg || ""))]);
    };
    (ExpectError.prototype = new ParseError());
    (ExpectError.prototype.constructor = ExpectError);
    (ExpectError.prototype.name = "ExpectError");
    var rec = function(def) {
        var value;
        return (value = def(function() {
            return value.apply(this, arguments);
        }));
    };
    var Parser = function(name, impl) {
        return Object.defineProperties(impl, {displayName:{value:name,writable:false},parserId:{value:uniqueParserId(),writable:false}});
    };
    var RecParser = function(name, body) {
        return Parser(name, rec(body));
    };
    var alwaysParser = function(x) {
        return function ALWAYS_PARSER(state, m, cok, cerr, eok) {
            return eok(x, state, m);
        };
    };
    var neverParser = constant(function NEVER_PARSER(state, m, cok, cerr, eok, eerr) {
        return eerr(new UnknownError(state.pos), state, m);
    });
    var bindParser = function(p, f) {
        return function BIND_PARSER(state, m, cok, cerr, eok, eerr) {
            var pcok = function(x, state, m) {
                return cont(f(x, state, m), [state, m, cok, cerr, cok, cerr]);
            },peok = function(x, state, m) {
                return cont(f(x, state, m), [state, m, cok, cerr, eok, eerr]);
            };
            return cont(p, [state, m, pcok, cerr, peok, eerr]);
        };
    };
    var bindaParser = function(p, f) {
        return bindParser(p, function(x, state) {
            return f.apply(undefined, stream.toArray(x).concat([state]));
        });
    };
    var eofParser = constant(function EOF_PARSER(state, m, cok, cerr, eok, eerr) {
        return (!state.input ? eok(null, state, m) : eerr(new ExpectError(state.pos, "end of input"), state, m));
    });
    var extractParser = function(f) {
        return function EXTRACT_PARSER(state, m, cok, cerr, eok) {
            return eok(f(state), state, m);
        };
    };
    var examineParser = bind(extractParser, identity);
    var attemptParser = function(p) {
        return function ATTEMPT_PARSER(state, m, cok, cerr, eok, eerr) {
            return cont(p, [state, m, cok, eerr, eok, eerr]);
        };
    };
    var lookaheadParser = function(p) {
        return function LOOKAHEAD_PARSER(state, m, cok, cerr, eok, eerr) {
            var ok = function(item, _, m) {
                return eok(item, state, m);
            };
            return cont(p, [state, m, ok, cerr, eok, eerr]);
        };
    };
    var nextParser = function(p, q) {
        return bindParser(p, constant(q));
    };
    var eitherParser = function(p, q) {
        return function EITHER_PARSER(state, m, cok, cerr, eok, eerr) {
            var peerr = function(errFromP, _, mFromP) {
                var qeerr = function(errFromQ, _, mFromQ) {
                    return eerr(new MultipleError(errFromP, errFromQ), state, mFromQ);
                };
                return cont(q, [state, mFromP, cok, cerr, eok, qeerr]);
            };
            return cont(p, [state, m, cok, cerr, eok, peerr]);
        };
    };
    var choiceParser = function() {
        var reducer = function(p, c) {
            return eitherParser(c, p);
        };
        return function() {
            return ((arguments.length === 0) ? neverParser : reduceRight.call(arguments, reducer));
        };
    }();
    var optionalParser = function(p, def) {
        return eitherParser(p, alwaysParser(def));
    };
    var _end = alwaysParser(stream.end);
    var _joinParser = function(joiner, p1, p2) {
        return bindParser(p1, function(v1) {
            return bindParser(p2, function(v2) {
                return alwaysParser(joiner(v1, v2));
            });
        });
    };
    var _optionalValueParser = function(p) {
        return optionalParser(p, stream.end);
    };
    var consParser = bind(_joinParser, stream.cons);
    var concatParser = bind(_joinParser, stream.concat);
    var sequenceParser = function() {
        var cons = function(p, q) {
            return consParser(q, p);
        };
        return function() {
            return reduceRight.call(arguments, cons, _end);
        };
    }();
    var manyParser = function() {
        var manyError = function() {
throw new Error("Many parser applied to a parser that accepts an empty string");        };
        return function MANY_PARSER(p) {
            var safeP = function(state, m, cok, cerr, eok, eerr) {
                return cont(p, [state, m, cok, cerr, manyError, eerr]);
            };
            return rec(function(self) {
                return _optionalValueParser(consParser(safeP, self));
            });
        };
    }();
    var many1Parser = function(p) {
        return consParser(p, manyParser(p));
    };
    var timesParser = function(n, p) {
        return ((n <= 0) ? _end : consParser(p, timesParser((n - 1), p)));
    };
    var betweenTimesParser = function() {
        var maxParser = function(max, p) {
            return ((max <= 0) ? _end : _optionalValueParser(consParser(p, maxParser((max - 1), p))));
        };
        return function(min, max, p) {
            return ((max < min) ? neverParser : concatParser(timesParser(min, p), maxParser((max - min), p)));
        };
    }();
    var betweenParser = function(open, close, p) {
        return nextParser(open, bindParser(p, function(x) {
            return nextParser(close, alwaysParser(x));
        }));
    };
    var sepBy1 = function(sep, p) {
        return rec(function(self) {
            return consParser(p, eitherParser(attemptParser(nextParser(sep, self)), _end));
        });
    };
    var sepBy = function(sep, p) {
        return _optionalValueParser(sepBy1(sep, p));
    };
    var tokenParser = function() {
        var UnexpectTokenError = function(pos, tok) {
            ParseError.call(this, pos);
            (this.tok = tok);
        };
        (UnexpectTokenError.prototype = new UnexpectError);
        (UnexpectTokenError.prototype.constructor = UnexpectTokenError);
        Object.defineProperty(UnexpectTokenError.prototype, "message", {get:function() {
            return ("Unexpected " + this.tok);
        }});
        return function(consume) {
            return function TOKEN_PARSER(state, m, cok, cerr, eok, eerr) {
                var pos = state.pos,input = state.input;
                if(!input){
                    return eerr(new UnexpectError(pos, "end of input"), state, m);
                }
                else{
                    var tok = stream.first(input);
                    return (consume(tok) ? cok(tok, state.next(tok), m) : eerr(new UnexpectTokenError(pos, tok), state, m));
                }
            };
        };
    }();
    var anyTokenParser = tokenParser(constant(true));
    var _charParser = function(pred, c) {
        return tokenParser(bind(pred, c));
    };
    var charParser = function(c, pred) {
        return _charParser((pred || eq), c);
    };
    var stringParser = function() {
        var reducer = function(p, c) {
            return nextParser(c, p);
        };
        return function(s, pred) {
            return map.call(s, bind(_charParser, (pred || eq))).reduceRight(reducer, alwaysParser(s));
        };
    }();
    var backtrackParser = function(p) {
        return function(state, m, cok, cerr, eok, eerr) {
            var pcok = function(x, state) {
                return cok(x, state, m);
            },pcerr = function(x, state) {
                return cerr(x, state, m);
            },peok = function(x, state) {
                return eok(x, state, m);
            },peerr = function(x, state) {
                return eerr(x, state, m);
            };
            return cont(p, [state, m, pcok, pcerr, peok, peerr]);
        };
    };
    var memoParser = function(p) {
        var id = (p.parserId || uniqueParserId());
        return function(state, m, cok, cerr, eok, eerr) {
            var entry = Memoer.lookup(m, id, state);
            if(entry){
                return cont(entry, [state, m, cok, cerr, eok, eerr]);
            }
            var pcok = function(x, pstate, pm) {
                var entry = function(_, m, cok) {
                    return cok(x, pstate, m);
                };
                return cok(x, pstate, Memoer.update(pm, id, entry, state));
            };
            var pcerr = function(x, pstate, pm) {
                var entry = function(_, m, cok, cerr) {
                    return cerr(x, pstate, m);
                };
                return cerr(x, pstate, Memoer.update(pm, id, entry, state));
            };
            var peok = function(x, pstate, pm) {
                var entry = function(_, m, cok, cerr, eok) {
                    return eok(x, pstate, m);
                };
                return eok(x, pstate, Memoer.update(pm, id, entry, state));
            };
            var peerr = function(x, pstate, pm) {
                var entry = function(_, m, cok, cerr, eok, eerr) {
                    return eerr(x, pstate, pm);
                };
                return eerr(x, pstate, Memoer.update(m, id, entry, state));
            };
            return cont(p, [state, m, pcok, pcerr, peok, peerr]);
        };
    };
    var exec = function(p, state, m, cok, cerr, eok, eerr) {
        return trampoline(p(state, m, cok, cerr, eok, eerr))();
    };
    var _makeParser = function(ok, err) {
        return function(p, state, m) {
            return exec(p, state, (m || null), ok, err, ok, err);
        };
    };
    var runState = _makeParser(constant, throwConstant);
    var runStream = function(p, s) {
        return runState(p, new InputState(s, new Position(0)));
    };
    var run = function(p, input) {
        return runStream(p, stream.from(input));
    };
    var runManyState = function(p, state) {
        var manyP = _optionalValueParser(bindParser(p, function(x, state, m) {
            return alwaysParser(stream.memoStream(x, bind(runState, manyP, state, m)));
        }));
        return runState(manyP, state);
    };
    var runManyStream = function(p, s) {
        return runManyState(p, new InputState(s, new Position(0)));
    };
    var runMany = function(p, input) {
        return runManyStream(p, stream.from(input));
    };
    var testState = _makeParser(constant(constant(true)), constant(constant(false)));
    var testStream = function(p, s) {
        return testState(p, new InputState(s, new Position(0)));
    };
    var test = function(p, input) {
        return testStream(p, stream.from(input));
    };
    return {ParseError:ParseError,UnknownError:UnknownError,UnexpectError:UnexpectError,ExpectError:ExpectError,InputState:InputState,Position:Position,rec:rec,Parser:Parser,RecParser:RecParser,always:alwaysParser,never:neverParser,bind:bindParser,binda:bindaParser,eof:eofParser,extract:extractParser,examine:examineParser,attempt:attemptParser,lookahead:lookaheadParser,next:nextParser,either:eitherParser,choice:choiceParser,optional:optionalParser,consParser:consParser,concatParser:concatParser,sequence:sequenceParser,many:manyParser,many1:many1Parser,times:timesParser,betweenTimes:betweenTimesParser,between:betweenParser,sepBy1:sepBy1,sepBy:sepBy,token:tokenParser,anyToken:anyTokenParser,character:charParser,string:stringParser,backtrack:backtrackParser,memo:memoParser,exec:exec,runState:runState,runStream:runStream,run:run,runManyState:runManyState,runManyStream:runManyStream,runMany:runMany,testState:testState,testStream:testStream,test:test};
});