import { IHttp, IModify, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { ButtonStyle, TextObjectType, UIKitInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { IUIKitModalViewParam } from "@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder";
import { AppEnum } from "../enum/App";
import { ModalsEnum } from "../enum/Modals";
import { getBasicUserInfo } from "../helpers/githubSDK";
import { getInteractionRoomData, storeInteractionRoomData } from "../persistance/roomInteraction";
import {} from "@rocket.chat/apps-engine/definition/uikit/"

export async function userProfileModal({
    access_token,
    modify,
    read,
    persistence,
    http,
    slashcommandcontext,
    uikitcontext
} : {
    access_token: String,
    modify : IModify,
    read: IRead,
    persistence: IPersistence,
    http: IHttp,
    slashcommandcontext: SlashCommandContext,
    uikitcontext?: UIKitInteractionContext
}) : Promise<IUIKitModalViewParam> {

    const viewId = ModalsEnum.USER_PROFILE_VIEW;
    const block = modify.getCreator().getBlockBuilder();
    const room = slashcommandcontext?.getRoom() || uikitcontext?.getInteractionData().room;
    const user = slashcommandcontext?.getSender() || uikitcontext?.getInteractionData().user;

    if (user?.id){
        let roomId;
        if (room?.id){
            roomId = room.id;
            await storeInteractionRoomData(persistence, user.id, roomId);
        }
        else {
            roomId = (await getInteractionRoomData(read.getPersistenceReader(), user.id)).roomId;
        }
    }

    const userInfo = await getBasicUserInfo(http, access_token);


    block.addContextBlock({
        elements: [
            block.newPlainTextObject(userInfo.email, true),
        ]
    })

    block.addSectionBlock({
        text: block.newPlainTextObject(userInfo.bio),
        accessory : block.newImageElement({
            imageUrl: userInfo.avatar,
            altText: userInfo.name
        })
    })

    block.addContextBlock({
        elements: [
            block.newPlainTextObject(`followers: ${userInfo.followers}`),
            block.newPlainTextObject(`following: ${userInfo.following}`)
        ]
    });

    block.addDividerBlock();

    block.addImageBlock({imageUrl : `https://activity-graph.herokuapp.com/graph?username=${userInfo.username}&bg_color=ffffff&color=708090&line=24292e&point=24292e`, altText: "Github Contribution Graph"});



    block.addDividerBlock();

    block.addSectionBlock({
        text: block.newPlainTextObject("Where should we teleport ?")
    })

    block.addActionsBlock({
        elements : [
            block.newButtonElement({
                text : {
                    text : "Share Profile",
                    type : TextObjectType.PLAINTEXT
                },
                actionId: ModalsEnum.SHARE_PROFILE,
                style : ButtonStyle.PRIMARY
            }),
            block.newButtonElement(
                {
                    actionId: "123",
                    value: "repo",
                    text: {
                        type: TextObjectType.PLAINTEXT,
                        text: "Repositories"
                    },
                    style: ButtonStyle.PRIMARY
                },
            ),
            block.newButtonElement(
                {
                    actionId: "123",
                    value: "repo",
                    text: {
                        type: TextObjectType.PLAINTEXT,
                        text: "Issues"
                    },
                    style: ButtonStyle.PRIMARY
                },
            ),
            block.newButtonElement(
                {
                    actionId: "123",
                    value: "repo",
                    text: {
                        type: TextObjectType.PLAINTEXT,
                        text: "Notifications"
                    },
                    style: ButtonStyle.PRIMARY
                },
            ),
            block.newButtonElement(
                {
                    actionId: "123",
                    value: "repo",
                    text: {
                        type: TextObjectType.PLAINTEXT,
                        text: "Your Feed"
                    },
                    style: ButtonStyle.PRIMARY
                },
            )
        ]
    })


    return  {
        id: viewId,
        title: {
            type: TextObjectType.PLAINTEXT,
            text: userInfo.name
        },
        blocks: block.getBlocks()
    }

}
