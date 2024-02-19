import axios from 'axios';
import { useQuery } from '@tanstack/vue-query';

export default function useProjectGroups() {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const ENDPOINT = `${baseUrl}/projects`;

    const fetchProjectGroups = async () => {
        try {
          const { data, status } = await axios.get(ENDPOINT);
          if (status !== 200) {
            throw new Error('Unable to fetch project groups data.');
          }
          return data;
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const { isPending, data } = useQuery({
        queryKey: ['projectGroups'],
        queryFn: () => fetchProjectGroups(),
    });

    return {
      isLoading: isPending,
      data,
    };
}
