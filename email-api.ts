import { URLSearchParams } from 'url';

const baseUrl = 'https://api.mail7.io';

const keys = {
    apikey: '3c14d35e-ea40-4175-a762-21cfdaf8646d',
    apisecret: 'b46b2a0b-36df-4cd7-bb53-bfc742988efc',
};

const requestOptions = {
    headers: {
        Accept: 'application/json',
    },
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export type Email = {
    from: string
    to: string
    subject: string
    text: string
    html: string
};

// Create random address
export const createEmailAddress = (): string => {
    const uuid = Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    const email = "user_" + uuid + "@mail7.io";
    return email;
}

// Retrieve the first email from inbox and delete it right away
export const getLatestEmail = async (email: string): Promise<Email> => {
    const queryParams = new URLSearchParams({ ...keys, to: email.split('@')[0], domain: email.split('@')[1] }).toString()
    const url = `${baseUrl}/inbox?${queryParams}`;
    let triesLeft = 10
    do {
        const response = await fetch(url, requestOptions);
        if (response.ok) {
            const body = await response.json();
            if (body.data.length > 0) {
                const mesId = body.data[0]._id;
                const rawEmail = body.data[0].mail_source;
                await deleteEmail(mesId);
                return {
                    from: rawEmail.from.value[0].address,
                    to: rawEmail.to.value[0].address,
                    subject: rawEmail.subject,
                    text: rawEmail.text,
                    html: rawEmail.html,
                };
            }
            await delay(1000);
        } else {
            console.error(`[API] could not read emails: ${await response.text()}`);
        }
        triesLeft--
    } while (triesLeft);
    throw console.error(`[API] inbox is empty for ${email}`);
};

export const deleteEmail = async (id: string) => {
    const queryParams = new URLSearchParams({ ...keys, mesid: id }).toString();
    const url = `${baseUrl}/delete?${queryParams}`;
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
        console.error(`[API] could not delete email: ${await response.text()}`);
    }
};