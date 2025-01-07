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

#[cfg(test)]
mod tests {
    use super::get_neighbors;

    #[test]
    fn test_get_neighbors() {
        let neighbors = get_neighbors(3, 3, 4, 3, 7, 9);
        // expect [(3, 2), (3, 4), (4, 2), (4, 4), (2, 3), (5, 3)]
        println!("neighbors: {:?}", neighbors);
    }
}
