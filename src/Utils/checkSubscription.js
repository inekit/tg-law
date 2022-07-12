module.exports = async function(ctx, groupId){

    const member = await ctx.telegram.getChatMember(groupId, ctx.from.id).catch(console.log);

    if (!member) return false;

    if (member.status != "member" && member.status != "administrator" && member.status != "creator" ){
        return false;
    } else {
        return true;
    }
    
}