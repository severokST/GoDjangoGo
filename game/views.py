from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

from game.game_code.world import Map

from glob import glob
from json import dump, load, dumps
from os import path

# Create your views here.


def new_player(name):
    return {}

def new_session(player_list):
    path = 'game//sessions//'
    session_id = max([int(session_file.split('.')[0].split('\\')[-1]) for session_file in glob(path+'*.json')])+1
    map = Map()
    game_state = map.map_to_dict()
    game_state.update(
        {
            'players': {
                player:{
                    'score': 0,
                    'resources':{
                    'influence': 0,
                    'wood': 10,
                    'stone': 10,
                    'minerals': 5,
                    'food': 10,
                    'glass': 0,
                    'metal': 0}} for player in player_list},
            'player_list': player_list,
            'turn': 0,
            'current_player': 0
         }
    )
    game_state_file = open('game\sessions\{}.json'.format(session_id), 'w')
    dump(game_state, game_state_file)
    game_state_file.close()

    return session_id


def game_view(request):

    user = 'player1'

    template = loader.get_template('game/game.html')
    game_session = request.GET.get('session')

    if not path.exists('game\sessions\{}.json'.format(game_session)):
        game_session = new_session(['player1', 'player2', 'bob'])

    game_file = open('game\sessions\{}.json'.format(game_session), 'r')
    game_context = load(game_file)
    game_file.close()

    print(game_session)



    #Steralise game session data for player. Censor player data for other players
    game_context.update({'players': [{'name':player, 'score':game_context['players'][player]['score']}
                                     for player in game_context['player_list']],
                         'resources': game_context['players'][user]['resources']
                         })

    game_context.update({'player_index': 0})


    context = {
        'session_id': game_session,
        'game_context': game_context,
        'game_data': dumps(game_context),
    }

    return HttpResponse(template.render(context, request))