import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * Custom hook to manage dashboard tab synchronization with URL slugs.
 * @param idToSlug Mapping of Tab IDs to URL path segments (slugs)
 * @param defaultId The default Tab ID to use if no slug is present or it's invalid
 */
export function useDashboardSlug<T extends string>(
    idToSlug: Record<T, string>,
    defaultId: T
) {
    const navigate = useNavigate();
    const { section } = useParams<{ section?: string }>();
    const [activeTab, setActiveTab] = useState<T>(defaultId);

    // Memoize slugToId to prevent unnecessary recalculations
    const slugToId = useMemo(() => {
        return Object.fromEntries(
            Object.entries(idToSlug).map(([k, v]) => [(v as string).toLowerCase(), k as T])
        ) as Record<string, T>;
    }, [idToSlug]);

    useEffect(() => {
        if (section) {
            const mapped = slugToId[section.toLowerCase()];
            if (mapped) {
                setActiveTab(mapped);
            } else {
                // If invalid slug, redirect to default
                navigate(`/dashboard/${idToSlug[defaultId]}`, { replace: true });
            }
        } else {
            // Ensure URL shows default slug
            navigate(`/dashboard/${idToSlug[defaultId]}`, { replace: true });
        }
    }, [section, slugToId, idToSlug, defaultId, navigate]);

    const handleTabChange = (id: string) => {
        const slug = idToSlug[id as T] || idToSlug[defaultId];
        navigate(`/dashboard/${slug}`);
        setActiveTab(id as T);
    };

    return { activeTab, setActiveTab, handleTabChange };
}
