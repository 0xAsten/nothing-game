use array::ArrayTrait;

fn get_neighbors(x: u8, y: u8, xMax: u8, yMax: u8, grid_x: u8, grid_y: u8) -> Array<(u8, u8)> {
    let mut neighbors = array![];

    // Add positions above and below the rectangle
    let mut i = x;
    loop {
        if i > xMax {
            break;
        }
        // Add position above if within grid bounds
        if y > 0 {
            neighbors.append((i, y - 1));
        }
        // Add position below if within grid bounds
        if yMax < grid_y - 1 {
            neighbors.append((i, yMax + 1));
        }
        i += 1;
    };

    // Add positions to the left and right of the rectangle
    let mut j = y;
    loop {
        if j > yMax {
            break;
        }
        // Add position to the left if within grid bounds
        if x > 0 {
            neighbors.append((x - 1, j));
        }
        // Add position to the right if within grid bounds
        if xMax < grid_x - 1 {
            neighbors.append((xMax + 1, j));
        }
        j += 1;
    };

    neighbors
}

fn get_owned(x: u8, y: u8, xMax: u8, yMax: u8) -> Array<(u8, u8)> {
    let mut owned = array![];
    for i in x..xMax + 1 {
        for j in y..yMax + 1 {
            owned.append((i, j));
        }
    };
    owned
}

fn is_within_rectangle(x: u8, y: u8, rect_x1: u8, rect_y1: u8, rect_x2: u8, rect_y2: u8) -> bool {
    x >= rect_x1 && x <= rect_x2 && y >= rect_y1 && y <= rect_y2
}

fn rectangles_overlap(x1: u8, y1: u8, x2: u8, y2: u8, x3: u8, y3: u8, x4: u8, y4: u8) -> bool {
    // Check if one rectangle is to the left of the other
    if x2 < x3 || x4 < x1 {
        return false;
    }
    // Check if one rectangle is above the other
    if y2 < y3 || y4 < y1 {
        return false;
    }
    true
}

fn rectangles_adjacent(x1: u8, y1: u8, x2: u8, y2: u8, x3: u8, y3: u8, x4: u8, y4: u8) -> bool {
    // Check if rectangles are not overlapping first
    if rectangles_overlap(x1, y1, x2, y2, x3, y3, x4, y4) {
        return false;
    }

    // Check if one rectangle is exactly one unit away from the other horizontally
    let horizontal_adjacent = (x2 + 1 == x3) || (x4 + 1 == x1);

    // Check if one rectangle is exactly one unit away from the other vertically
    let vertical_adjacent = (y2 + 1 == y3) || (y4 + 1 == y1);

    // Check if rectangles share any y-coordinates while being horizontally adjacent
    let horizontal_touch = horizontal_adjacent && !((y2 < y3 && y2 < y4) || (y1 > y3 && y1 > y4));

    // Check if rectangles share any x-coordinates while being vertically adjacent
    let vertical_touch = vertical_adjacent && !((x2 < x3 && x2 < x4) || (x1 > x3 && x1 > x4));

    horizontal_touch || vertical_touch
}

#[cfg(test)]
mod tests {
    use super::{get_neighbors, get_owned, rectangles_overlap, rectangles_adjacent};

    #[test]
    fn test_get_neighbors() {
        let neighbors = get_neighbors(3, 3, 4, 3, 7, 9);
        // expect [(3, 2), (3, 4), (4, 2), (4, 4), (2, 3), (5, 3)]
        println!("neighbors: {:?}", neighbors);
    }

    #[test]
    fn test_get_owned() {
        let owned = get_owned(3, 3, 4, 3);
        // expect [(3, 3), (4, 3)]
        println!("owned: {:?}", owned);
    }

    #[test]
    fn test_rectangles_overlap() {
        assert(rectangles_overlap(3, 3, 4, 3, 2, 2, 5, 5), '1 overlap');
        assert(rectangles_overlap(3, 3, 4, 3, 2, 2, 3, 3), '2 overlap');
        assert(!rectangles_overlap(3, 3, 4, 3, 5, 5, 6, 6), '3 no overlap');
        assert(!rectangles_overlap(3, 3, 4, 3, 2, 2, 2, 3), '4 no overlap');
        assert(!rectangles_overlap(3, 3, 4, 3, 2, 2, 3, 2), '5 no overlap');
        assert(rectangles_overlap(2, 2, 5, 5, 3, 3, 4, 3), '1 reverse overlap');
        assert(rectangles_overlap(2, 2, 3, 3, 3, 3, 4, 3), '2 reverse overlap');
        assert(!rectangles_overlap(5, 5, 6, 6, 3, 3, 4, 3), '3 reverse no overlap');
        assert(!rectangles_overlap(2, 2, 2, 3, 3, 3, 4, 3), '4 reverse no overlap');
        assert(!rectangles_overlap(2, 2, 3, 2, 3, 3, 4, 3), '5 reverse no overlap');
    }

    #[test]
    fn test_rectangles_adjacent() {
        // Test horizontally adjacent rectangles
        assert(rectangles_adjacent(1, 1, 2, 2, 3, 1, 4, 2), 'should be adjacent 1');

        // Test vertically adjacent rectangles
        assert(rectangles_adjacent(1, 1, 2, 2, 1, 3, 2, 4), 'should be adjacent 2');

        // Test non-adjacent rectangles
        assert(!rectangles_adjacent(1, 1, 2, 2, 4, 4, 5, 5), 'should not be adjacent 1');

        // Test overlapping rectangles
        assert(!rectangles_adjacent(1, 1, 3, 3, 2, 2, 4, 4), 'should not be adjacent 2');

        // Test diagonally adjacent (should return false)
        assert(!rectangles_adjacent(1, 1, 2, 2, 3, 3, 4, 4), 'diagonals not adjacent');
    }
}
