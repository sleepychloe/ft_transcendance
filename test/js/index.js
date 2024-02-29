
let obj = {
        str: 'before',
};

export function get_obj() {
        return obj;
}

export function test(game_data) {
        game_data.str = 'changed';
}
