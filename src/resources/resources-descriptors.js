export default [
    {
        url: '/file/find',
        method: 'GET',
        rpcPath: 'file.find'
    },
    {
        url: '/file/remove',
        method: 'DELETE',
        rpcPath: 'file.remove'
    },
    {
        url: '/log/get',
        method: 'GET',
        rpcPath: 'log.get'
    },
    {
        url: '/post/createOrUpdate',
        method: 'POST',
        rpcPath: 'post.createOrUpdate'
    },
    {
        url: '/post/export',
        method: 'POST',
        rpcPath: 'post.export'
    },
    {
        url: '/post/get',
        method: 'GET',
        rpcPath: 'post.get'
    },
    {
        url: '/post/import',
        method: 'GET',
        rpcPath: 'post.import'
    },
    {
        url: '/post/list',
        method: 'GET',
        rpcPath: 'post.list'
    },
    {
        rpcPath: 'post.pubGet'
    },
    {
        url: '/post/publish',
        method: 'POST',
        rpcPath: 'post.publish'
    },
    {
        rpcPath: 'post.pubList'
    },
    {
        url: '/post/remove',
        method: 'DELETE',
        rpcPath: 'post.remove'
    },
    {
        url: '/post/unpublish',
        method: 'POST',
        rpcPath: 'post.unpublish'
    },
    {
        url: '/tag/list',
        method: 'GET',
        rpcPath: 'tag.list'
    },
    {
        url: '/user/get',
        method: 'GET',
        rpcPath: 'user.get'
    }
]