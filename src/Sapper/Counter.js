import React from 'react';

export default function Counter(props)
{
    const c = props.count > 999 ? 999 : props.count;

    const digits = c.toString().split('').reverse();
    const count = new Array(3);

    for(let i=0; i < count.length; i++) {
        const digit = digits[i] !== undefined ? digits[i] : "0";
        count[i] = <div key={i} className={"board__number board__number_"+digit}> </div>;
    }
    count.reverse();

    return (
        <div className="board__counter">
            {count}
        </div>
    );
}