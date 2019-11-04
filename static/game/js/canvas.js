

window.onload = function canvas_init() {

    var canvas = document.getElementById('gameCanvas');

    let index;

    for (index=0; index < game_state.tiles.length; index++){game_state.tiles[index].selected = false;}

    redraw_map();
    canvas.addEventListener("wheel", change_zoom, false);
    canvas.addEventListener("mousemove", change_pan, false);
    canvas.addEventListener("mousedown", map_click, false);
    canvas.addEventListener("mouseup", map_click_release, false);
    canvas.addEventListener("mouseout", function () {drag=false;});
};

function map_click(event){
    drag = true;
    mx = event.clientX;
    my = event.clientY;
}

function map_click_release(event){

    drag = false;

    if (mx === event.clientX && my === event.clientY){

        let index;
        let canvas = document.getElementById('gameCanvas');
        let rect = canvas.getBoundingClientRect();
        let x_scale = canvas.clientWidth / canvas.width;
        let y_scale = canvas.clientHeight / canvas.height;

        let mouse_x = (event.clientX - rect.left)/x_scale;
        let mouse_y = (event.clientY - rect.top)/y_scale;
        for(index = 0; index<cell_regions.length; index++){
            if(cell_regions[index].bound[0] < mouse_x
                && mouse_x < cell_regions[index].bound[2]
                && cell_regions[index].bound[1] < mouse_y
                && mouse_y <cell_regions[index].bound[3] ){


                    selected_tile = cell_regions[index].id;

                    console.log('Clicked', game_state.tiles[selected_tile].tile,'tile ', selected_tile);

                    redraw = true;
                break;

            }
        }
    }
}

function change_pan(event) {

    let index;
    let redraw = false;

    let canvas = document.getElementById('gameCanvas');
    let x_scale = canvas.clientWidth / canvas.width;
    let y_scale = canvas.clientHeight / canvas.height;

    if(drag){
        px += event.movementX / x_scale;
        py += event.movementY / y_scale;
        redraw = true;
    }

    else{

        let rect = canvas.getBoundingClientRect();



        let grid_size = (zoom * canvas.width)/50;
        let mouse_x = (event.clientX - rect.left)/x_scale;
        let mouse_y = (event.clientY - rect.top)/y_scale;
        for(index = 0; index<cell_regions.length; index++){
            if(cell_regions[index].bound[0] < mouse_x
                && mouse_x < cell_regions[index].bound[2]
                && cell_regions[index].bound[1] < mouse_y
                && mouse_y <cell_regions[index].bound[3] ){
                    mouse_over_tile = cell_regions[index].id;
                    redraw = true;
            }
        }

    }

    if(redraw){redraw_map()}
}

function change_zoom(event) {
    zoom += event.deltaY *0.1;
    if (zoom < 0.1){zoom = 0.1}
    redraw_map()
}

function barrier_pos(element_x, element_y, zoom, orientation){



}

function redraw_map(){
    let canvas = document.getElementById('gameCanvas');



    let colour_map = {'Grass': '#00a800', 'Rock': '#a3a3a3', 'Sand': '#d4d605'};
    let colour_border = {'Grass': '#009b00', 'Rock': '#777777', 'Sand': '#969600'};
    let colour_barrier = {'forest': '#0f801c', 'rock': '#606060'};
    let index;
    let cx = canvas.width/2;
    let cy = canvas.height/2;
    let grid_size = (zoom * canvas.width)/50;


    let hex_size = grid_size * 1.1;
    let hex_width = grid_size / 8;


    draw_x_min = -grid_size;
    draw_x_max = canvas.width + grid_size;
    draw_y_min = -grid_size;
    draw_y_max = canvas.height + grid_size;

    cell_regions = [];
    end_angle = 2* Math.PI;
    if (canvas.getContext){
        let ctx = canvas.getContext("2d");


        let texture_map = {
            'Grass': ctx.createPattern(document.getElementById('texture_grass'), 'repeat'),
            'Rock': ctx.createPattern(document.getElementById('texture_mountain'), 'repeat'),
            'Sand': ctx.createPattern(document.getElementById('texture_sand'), 'repeat'),
            'Water': ctx.createPattern(document.getElementById('texture_water'), 'repeat'),
        };



        let barrier_map = {
            'forest': ctx.createPattern(document.getElementById('barrier_tree'), 'repeat'),
            'rock': ctx.createPattern(document.getElementById('barrier_rock'), 'repeat'),

        };

        //ctx.translate(px,py);

        ctx.clearRect(0,0, canvas.width, canvas.height);

        ctx.fillStyle=texture_map.Water;

        ctx.beginPath();
        ctx.rect(0,0,canvas.width, canvas.height);
        ctx.stroke();
        ctx.fill();

        ctx.lineWidth = hex_width;
        let vertex;
        //Draw tiles
        for (index=0; index < game_state.tiles.length; index++){
            if (game_state.tiles[index].tile !== "Water"){
                element_x = game_state.tiles[index].position[0]* grid_size + px + cx;
                element_y = game_state.tiles[index].position[1]* grid_size + py + cy;
                if ( draw_x_min < element_x && element_x < draw_x_max && draw_y_min < element_y && element_y < draw_y_max )
                {
                    ctx.beginPath();

                    ctx.moveTo(
                        hex_size * Math.cos(0)+element_x,
                        hex_size * Math.sin(0)+element_y,
                    );

                    if (index === mouse_over_tile){ctx.strokeStyle = 'red';}
                    else {ctx.strokeStyle = render_hex_border?colour_border[game_state.tiles[index].tile]:texture_map[game_state.tiles[index].tile];}

                    for (vertex = 1; vertex < 7; vertex++){

                        ctx.lineTo(
                            hex_size * Math.cos(Math.PI * (vertex % 6) / 3) + element_x,
                            hex_size * Math.sin(Math.PI * (vertex % 6) / 3) + element_y,
                        );
                    }

                    //ctx.arc(element_x,element_y, grid_size, 0, end_angle );
                    ctx.fillStyle = texture_map[game_state.tiles[index].tile];
                    ctx.fill();
                    ctx.stroke();
                    cell_regions.push({'bound':[element_x-grid_size, element_y-grid_size, element_x+grid_size, element_y+grid_size], 'id':index})
                }
            }
        }

        //Draw Barriers/resources
        ctx.lineWidth = grid_size/2;
        for(index=0; index< game_state.barriers.length; index++){
            element_x = game_state.barriers[index].position[0]* grid_size + px + cx;
            element_y = game_state.barriers[index].position[1]* grid_size + py + cy;
            if ( draw_x_min < element_x && element_x < draw_x_max && draw_y_min < element_y && element_y < draw_y_max )
            {
                ctx.beginPath();

                ctx.strokeStyle = barrier_map[game_state.barriers[index].type];


                ctx.moveTo(
                    grid_size*.8 * Math.cos(Math.PI*((2+game_state.barriers[index].orientation)/3))+element_x,
                    grid_size*.8 * Math.sin(Math.PI*((2+game_state.barriers[index].orientation)/3))+element_y,
                );

                ctx.lineTo(
                    grid_size*.8 * Math.cos(Math.PI* ((5+game_state.barriers[index].orientation)/3))+element_x,
                    grid_size*.8 * Math.sin(Math.PI* ((5+game_state.barriers[index].orientation)/3))+element_y,
                );



                ctx.fill();
                ctx.stroke();

            }

        }


    }
}