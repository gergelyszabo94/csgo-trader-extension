function PopulateActions( prefix, elActions, rgActions, item, owner )
        {
            elActions.update('');
            if ( !rgActions )
            {
                elActions.hide();
                return;
            }
            rgActions=rgActions.filter(element => element.id!=="inbrowser" && element.id!=="onserver");
                let inspectLink = rgActions[0].link;
                if(inspectLink.substring(0,20)==="steam://rungame/730/"){ //makes sure it's a csgo inspect button
                    rgActions.push({name: "Inspect in Browser...", link: "https://market.swap.gg/screenshot?inspectLink="+inspectLink, id: "inbrowser"});
                    rgActions.push({name: "Inspect on Server...", link: "steam://connect/51.75.73.121:27015", id: "onServer"});
                }
            for ( var i = 0; i < rgActions.length; i++ )
            {
                var action = rgActions[i];
                if ( !action.link || !action.name )
                    continue;
                
                var strLink = action.link.replace( "%assetid%", item.assetid );
                strLink = strLink.replace( "%contextid%", item.contextid );
                if ( owner )
                {
                    if ( typeof owner == 'string' )
                        strLink = strLink.replace( "%owner_steamid%", owner );
                    else
                        strLink = strLink.replace( "%owner_steamid%", owner.GetSteamId() );
                }
        
                // hack to handle "grind into goo" action
                if ( strLink.match( /^javascript:GetGooValue/ ) )
                {
                    HandleGetGooValueAction( prefix, item, strLink );
                    continue;
                }
                
                let target = "_self"; 
                if(action.id==="inbrowser"){
                    target = "_blank";
                }
                
                var elAction = new Element(
                    'a',
                    {
                        'class': 'btn_small btn_grey_white_innerfade ' + action.id,
                        href: strLink,
                        target: target
                    }
                );
                
                if (action.id === "onServer") {
                  elAction = new Element(
                    'span',
                    {
                        'class': 'btn_small btn_grey_white_innerfade ' + action.id
                    });
                }

                var elSpan = new Element( 'span' );
                elSpan.update( action.name );
                elAction.appendChild( elSpan );
                elActions.appendChild( elAction );
            }
            elActions.show();
        }