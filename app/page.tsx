import HomeMasonryStatic from "@/app/components/home/HomeMasonryStatic";
import HomePageClient from "@/app/components/home/HomePageClient";
import {
    DEFAULT_HOME_PROJECTS_OPTIONS,
    getVisibleHomeProjects,
} from "@/app/lib/home-projects";
import { projects } from "@/app/projects/data";

export default function Home() {
    const initialProjects = getVisibleHomeProjects(
        projects,
        DEFAULT_HOME_PROJECTS_OPTIONS,
    );

    return (
        <HomePageClient>
            <HomeMasonryStatic
                projects={initialProjects}
                showDrafts={false}
            />
        </HomePageClient>
    );
}
