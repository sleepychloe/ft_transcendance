import { test } from './index.js';
import { get_obj } from './index.js';

export function test2() {
        let obj = get_obj();
        console.log('before:', obj.str);
        test(obj);
        console.log('after:', obj.str);
}
