import fetch from "node-fetch";
import { useFetch } from "@raycast/utils";
import { getPreferenceValues } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import fs from "fs";
import FormData from "form-data";

export type User = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  lastUpdatedAt: string;
};

const postsEndpoint = `${getPreferenceValues().site}wp-json/wp/v2`;
const mediaEndpoint = `${getPreferenceValues().site}wp-json/wp/v2/media`;
const typesEndpoint = `${getPreferenceValues().site}wp-json/wp/v2/types`;
const typeEndpoint = `${getPreferenceValues().site}wp-json/custom/v1/post-meta`;
const password = `${getPreferenceValues().password}`;
const username = `${getPreferenceValues().username}`;

export async function createPost(type: string, properties: any) {
  const { title, content, status, featured, ...meta } = properties;

  console.log("meta again:", title, content, status, featured, meta, type);

  let featuredMedia = null;

  if (featured && featured.length > 0) {
    console.log("featured:", featured);
    const file = featured[0];

    var form = new FormData();
    console.log("two:", form);

    form.append("title", title || "Image");
    form.append("caption", title || "Image");
    form.append("file", fs.createReadStream(file));

    console.log("file:", file);

    const response = await fetch(mediaEndpoint, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${username}:${password}`),
      },
      body: form,
    });
    const data = await response.json();
    featuredMedia = data.id;

    console.log("response:", data);

    if (!response.ok) {
      throw Error(`${response.statusText} (HTTP ${response.status})`);
    }
  }

  const body = {
    meta,
  };

  if (title) {
    body.title = title;
  }

  if (content) {
    body.content = content;
  }

  if (status) {
    body.status = status;
  }

  if (featuredMedia) {
    body.featured_media = featuredMedia;
  }

  const response = await fetch(`${postsEndpoint}/${type}`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(`${username}:${password}`),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  console.log("response create:", response);

  if (!response.ok) {
    throw Error(`${response.statusText} (HTTP ${response.status})`);
  }
}

export async function updatePost(type: string, post: string, properties: any) {
  const { title, content, status, featured, ...meta } = properties;
  console.log("properties:", type, post, properties);

  let featuredMedia = null;

  if (featured && featured.length > 0) {
    const file = featured[0];

    var form = new FormData();
    form.append("title", title || "Image");
    form.append("caption", title || "Image");
    form.append("file", fs.createReadStream(file));

    console.log("file:", file);

    const response = await fetch(mediaEndpoint, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${username}:${password}`),
      },
      body: form,
    });
    const data = await response.json();
    featuredMedia = data.id;

    console.log("response:", data);

    if (!response.ok) {
      throw Error(`${response.statusText} (HTTP ${response.status})`);
    }
  }

  const body = {
    meta,
  };

  if (title) {
    body.title = title;
  }

  if (content) {
    body.content = content;
  }

  if (status) {
    body.status = status;
  }

  if (featuredMedia) {
    body.featured_media = featuredMedia;
  }

  console.log("meta:", body);

  const response = await fetch(`${postsEndpoint}/${type}/${post}`, {
    method: "PUT",
    headers: {
      Authorization: "Basic " + btoa(`${username}:${password}`),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw Error(`${response.statusText} (HTTP ${response.status})`);
  }
}

export async function updateUser(user: User, change: { email?: string; firstName?: string; lastName?: string }) {
  const updatedUser = {
    ...change,
    createdAt: user.createdAt,
    lastUpdatedAt: new Date().toUTCString(),
  };

  const response = await fetch(`${postsEndpoint}/${user._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedUser),
  });

  if (!response.ok) {
    throw Error(`${response.statusText} (HTTP ${response.status})`);
  }
}

export async function deleteUser(user: User) {
  const response = await fetch(`${postsEndpoint}/${user._id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw Error(`${response.statusText} (HTTP ${response.status})`);
  }
}

export function usePosts(type: string) {
  console.log(`${username}:${password}`);
  return useFetch<User[]>(`${postsEndpoint}/${type}?_embed=wp:featuredmedia&status=any`, {
    headers: { Authorization: "Basic " + btoa(`${username}:${password}`) },
  });
}

export function useTypes() {
  console.log(`${username}:${password}`);
  return useFetch<User[]>(typesEndpoint, { headers: { Authorization: "Basic " + btoa(`${username}:${password}`) } });
}

export function usePostType(type: string) {
  console.log("fetch:", `${typeEndpoint}/${type}`);
  return useFetch<User, User>(`${typeEndpoint}/${type}`, {
    headers: { Authorization: "Basic " + btoa(`${username}:${password}`) },
  });
}
