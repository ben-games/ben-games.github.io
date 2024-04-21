const getProjectMetadata = async (projectId) => {
    // IF IN A WEB BROWSER, you need to use a service like trampoline.turbowarp.org to access the Scratch API.
    // IF IN NODE.JS, you should use https://api.scratch.mit.edu/projects/${projectId} directly instead.
    const response = await fetch(`https://trampoline.turbowarp.org/api/projects/${projectId}`);
    if (response.status === 404) {
        throw new Error('The project is unshared or does not exist');
    }
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status} fetching project metadata`);
    }
    const json = await response.json();
    return json;
};

const getProjectData = async (projectId) => {
    const metadata = await getProjectMetadata(projectId);
    const token = metadata.project_token;
    const response = await fetch(`https://projects.scratch.mit.edu/${projectId}?token=${token}`);
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status} fetching project data`);
    }
    const data = await response.arrayBuffer();
    return data;
};

getProjectData('60917032').then((data) => {
    console.log(data);
}).catch((error) => {
    console.error(error);
});
